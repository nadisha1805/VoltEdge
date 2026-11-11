import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireCustomerAuth, CustomerAuthRequest } from '../middleware/customerAuth.js';

const router = Router();

router.use(requireCustomerAuth);

// 1. GET /api/customer/orders - List customer's orders
router.get('/', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const customerId = req.customer!.customerId;

    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
        payment: {
          select: {
            id: true,
            status: true,
            method: true,
            razorpayPaymentId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer orders.' });
  }
});

// 2. GET /api/customer/orders/:id - Get specific order details with strict ownership verification
router.get('/:id', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.customer!.customerId;

    const order = await prisma.order.findFirst({
      where: { id, customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                primaryImage: true,
              },
            },
          },
        },
        payment: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        invoice: true,
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to access it.',
      });
      return;
    }

    res.json({
      success: true,
      order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
  }
});

// 3. GET /api/customer/orders/:id/invoice - Structured Invoice Generation
router.get('/:id/invoice', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.customer!.customerId;

    const order = await prisma.order.findFirst({
      where: { id, customerId },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized to view invoice.',
      });
      return;
    }

    // Invoice number
    const invoiceNumber = `INV-${order.orderNumber.replace('VOLT-', '')}`;

    // Get showroom settings
    const settings = await prisma.showroomSettings.findFirst({
      where: { id: 'default' },
    });

    const invoiceData = {
      invoiceNumber,
      issuedAt: order.createdAt,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference || 'N/A',
      seller: {
        name: settings?.storeName || 'VOLTEDGE Electronics Pvt. Ltd.',
        tagline: settings?.tagline || 'Powering Your Digital World.',
        address: settings?.address || 'Plot 42, Digital Corridor, Cyber City, Bangalore - 560100',
        phone: settings?.phone || '+91 98765 43210',
        email: settings?.email || 'support@voltedge-electronics.com',
        gstin: '29ABCDE1234F1Z5',
      },
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone || 'N/A',
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress || order.shippingAddress,
      },
      items: order.items.map(item => ({
        id: item.id,
        name: item.productName,
        sku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      pricing: {
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        couponCode: order.couponCode,
        taxAmount: order.taxAmount,
        shippingFee: order.shippingFee,
        totalAmount: order.totalAmount,
      },
    };

    // Store/Upsert in DB
    await prisma.invoice.upsert({
      where: { orderId: order.id },
      update: {
        invoiceData: JSON.stringify(invoiceData),
      },
      create: {
        orderId: order.id,
        invoiceNumber,
        invoiceData: JSON.stringify(invoiceData),
      },
    });

    res.json({
      success: true,
      invoice: invoiceData,
    });
  } catch (error: any) {
    console.error('Invoice Generation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice.' });
  }
});

export default router;

