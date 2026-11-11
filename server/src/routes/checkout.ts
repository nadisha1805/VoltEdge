import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireCustomerAuth, CustomerAuthRequest } from '../middleware/customerAuth.js';
import { sendEmailNotification, emailTemplates } from '../utils/mailer.js';

const router = Router();

router.use(requireCustomerAuth);

// Helper function to calculate cart totals and validate stock
const calculateCheckoutTotals = async (customerId: string, couponCode?: string, shippingMethod = 'STANDARD') => {
  const cart = await prisma.cart.findUnique({
    where: { customerId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Your shopping cart is empty.');
  }

  let subtotal = 0;
  const lineItems: Array<{
    productId: string;
    productName: string;
    productSku: string;
    productImageUrl: string | null;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    availableStock: number;
  }> = [];

  for (const item of cart.items) {
    if (!item.product || item.product.isArchived) {
      throw new Error(`One or more products in your cart are no longer available.`);
    }

    if (item.product.stockQuantity < item.quantity) {
      throw new Error(
        `Insufficient stock for "${item.product.name}". Only ${item.product.stockQuantity} unit(s) left in showroom.`
      );
    }

    const unitPrice = item.product.sellingPrice;
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    lineItems.push({
      productId: item.productId,
      productName: item.product.name,
      productSku: item.product.sku,
      productImageUrl: item.product.primaryImage,
      unitPrice,
      quantity: item.quantity,
      totalPrice: itemTotal,
      availableStock: item.product.stockQuantity,
    });
  }

  // Shipping Calculation
  // Standard: Free over ₹50,000, else ₹499
  // Express: ₹999 flat
  let shippingFee = 0;
  if (shippingMethod === 'EXPRESS') {
    shippingFee = 999;
  } else {
    shippingFee = subtotal >= 50000 ? 0 : 499;
  }

  // Coupon Discount Calculation
  let discountAmount = 0;
  let validatedCoupon = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive || coupon.isArchived) {
      throw new Error('Coupon code is invalid or has expired.');
    }

    const now = new Date();
    if (coupon.startDate > now || (coupon.expiryDate && coupon.expiryDate < now)) {
      throw new Error('Coupon is not active or has expired.');
    }

    if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
      throw new Error(`Coupon requires a minimum order amount of ₹${coupon.minOrderAmount.toLocaleString('en-IN')}.`);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new Error('Coupon usage limit has been reached.');
    }

    // Check per-customer usage limit
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (customer && coupon.perCustomerLimit) {
      const priorUsage = await prisma.couponUsage.count({
        where: { couponId: coupon.id, customerEmail: customer.email },
      });
      if (priorUsage >= coupon.perCustomerLimit) {
        throw new Error('You have already reached the maximum usage limit for this coupon.');
      }
    }

    if (coupon.discountType === 'PERCENTAGE') {
      let calculated = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && calculated > coupon.maxDiscount) {
        calculated = coupon.maxDiscount;
      }
      discountAmount = Math.round(calculated);
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    validatedCoupon = coupon;
  }

  // Tax calculation: 18% GST on taxable base (subtotal - discount)
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableBase * 0.18);
  const totalAmount = taxableBase + taxAmount + shippingFee;

  return {
    lineItems,
    subtotal,
    discountAmount,
    taxAmount,
    shippingFee,
    totalAmount,
    shippingMethod,
    coupon: validatedCoupon,
  };
};

// 1. POST /api/checkout/validate - Pre-flight checkout validation
router.post('/validate', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const customerId = req.customer!.customerId;
    const { couponCode, shippingMethod = 'STANDARD' } = req.body;

    const summary = await calculateCheckoutTotals(customerId, couponCode, shippingMethod);

    res.json({
      success: true,
      summary: {
        itemCount: summary.lineItems.reduce((acc, i) => acc + i.quantity, 0),
        items: summary.lineItems,
        subtotal: summary.subtotal,
        discountAmount: summary.discountAmount,
        couponCode: summary.coupon?.code || null,
        taxAmount: summary.taxAmount,
        shippingFee: summary.shippingFee,
        shippingMethod: summary.shippingMethod,
        totalAmount: summary.totalAmount,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Validation failed.' });
  }
});

// 2. POST /api/checkout/apply-coupon - Validate and apply coupon code
router.post('/apply-coupon', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const customerId = req.customer!.customerId;
    const { code, shippingMethod = 'STANDARD' } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
      return;
    }

    const summary = await calculateCheckoutTotals(customerId, code, shippingMethod);

    res.json({
      success: true,
      message: `Coupon "${summary.coupon?.code}" applied successfully! You save ₹${summary.discountAmount.toLocaleString('en-IN')}.`,
      discountAmount: summary.discountAmount,
      totalAmount: summary.totalAmount,
      taxAmount: summary.taxAmount,
      couponCode: summary.coupon?.code,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid coupon code.' });
  }
});

// 3. POST /api/checkout/create-order - Create Order & Reserve Inventory
router.post('/create-order', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const customerId = req.customer!.customerId;
    const {
      addressId,
      shippingAddressData,
      paymentMethod = 'CASH_ON_DELIVERY',
      shippingMethod = 'STANDARD',
      couponCode,
      notes,
    } = req.body;

    // Validate customer and address
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer account not found.' });
      return;
    }

    let finalAddressString = '';
    if (addressId) {
      const address = await prisma.customerAddress.findFirst({
        where: { id: addressId, customerId },
      });
      if (!address) {
        res.status(400).json({ success: false, message: 'Selected delivery address does not exist.' });
        return;
      }
      finalAddressString = `${address.fullName || customer.firstName + ' ' + customer.lastName}, ${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.postalCode}, ${address.country}. Ph: ${address.phone || customer.phone || 'N/A'}`;
    } else if (shippingAddressData) {
      finalAddressString = `${shippingAddressData.fullName}, ${shippingAddressData.addressLine1}${shippingAddressData.addressLine2 ? ', ' + shippingAddressData.addressLine2 : ''}, ${shippingAddressData.city}, ${shippingAddressData.state} - ${shippingAddressData.postalCode}, ${shippingAddressData.country || 'India'}. Ph: ${shippingAddressData.phone || 'N/A'}`;
    } else {
      res.status(400).json({ success: false, message: 'Delivery address is required.' });
      return;
    }

    // COD Enabled check
    if (paymentMethod === 'CASH_ON_DELIVERY') {
      const isCodEnabled = process.env.COD_ENABLED !== 'false';
      if (!isCodEnabled) {
        res.status(400).json({
          success: false,
          message: 'Cash on Delivery is currently disabled by the showroom.',
        });
        return;
      }
    }

    // Run order creation and stock deduction inside an atomic Prisma transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // Recalculate everything inside the transaction
      const summary = await calculateCheckoutTotals(customerId, couponCode, shippingMethod);

      // Unique Order Number: e.g. VOLT-YYYY-RANDOM
      const orderCount = await tx.order.count();
      const orderNumber = `VOLT-${new Date().getFullYear()}-${1000 + orderCount + 1}`;

      // Deduct stock and record inventory movement for each line item
      for (const item of summary.lineItems) {
        const prod = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!prod || prod.stockQuantity < item.quantity) {
          throw new Error(`Product "${item.productName}" ran out of stock during checkout.`);
        }

        const newStock = prod.stockQuantity - item.quantity;
        const stockStatus = newStock === 0 ? 'OUT_OF_STOCK' : newStock <= 5 ? 'LOW_STOCK' : 'IN_STOCK';

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: newStock,
            stockStatus,
          },
        });

        // Record stock movement audit
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            previousQuantity: prod.stockQuantity,
            quantityChanged: -item.quantity,
            newQuantity: newStock,
            movementType: 'STOCK_OUT',
            reason: `Customer Checkout - Order #${orderNumber}`,
            referenceNumber: orderNumber,
            updatedBy: `Customer Portal (${customer.email})`,
          },
        });
      }

      // Initial statuses
      const paymentStatus = 'PENDING';
      const orderStatus = paymentMethod === 'CASH_ON_DELIVERY' ? 'CONFIRMED' : 'PENDING';

      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          customerName: `${customer.firstName} ${customer.lastName}`.trim(),
          customerEmail: customer.email,
          customerPhone: customer.phone,
          shippingAddress: finalAddressString,
          billingAddress: finalAddressString,
          shippingMethod,
          subtotal: summary.subtotal,
          discountAmount: summary.discountAmount,
          taxAmount: summary.taxAmount,
          shippingFee: summary.shippingFee,
          totalAmount: summary.totalAmount,
          paymentStatus,
          paymentMethod,
          orderStatus,
          notes,
          couponCode: summary.coupon?.code || null,
          items: {
            create: summary.lineItems.map(item => ({
              productId: item.productId,
              productName: item.productName,
              productSku: item.productSku,
              productImageUrl: item.productImageUrl,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
            })),
          },
          statusHistory: {
            create: {
              status: orderStatus,
              comment: `Order placed via Customer Portal. Payment method: ${paymentMethod}.`,
              updatedBy: 'System',
            },
          },
        },
        include: {
          items: true,
        },
      });

      // Record Payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: summary.totalAmount,
          currency: 'INR',
          method: paymentMethod,
          status: paymentStatus,
        },
      });

      // If coupon used, increment coupon usage and record CouponUsage
      if (summary.coupon) {
        await tx.coupon.update({
          where: { id: summary.coupon.id },
          data: { usageCount: { increment: 1 } },
        });

        await tx.couponUsage.create({
          data: {
            couponId: summary.coupon.id,
            orderId: order.id,
            customerEmail: customer.email,
            discountApplied: summary.discountAmount,
          },
        });
      }

      // Update customer total orders and total spent
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: summary.totalAmount },
        },
      });

      // Clear customer's cart
      const cart = await tx.cart.findUnique({ where: { customerId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return order;
    });

    // Send confirmation email
    const orderConf = emailTemplates.orderConfirmation(
      newOrder.orderNumber,
      newOrder.customerName,
      newOrder.totalAmount,
      newOrder.items
    );
    await sendEmailNotification({
      to: newOrder.customerEmail,
      subject: orderConf.subject,
      html: orderConf.html,
      text: `Order #${newOrder.orderNumber} confirmed. Total: ₹${newOrder.totalAmount}`,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: newOrder,
    });
  } catch (error: any) {
    console.error('Order Creation Error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to place order.' });
  }
});

export default router;

