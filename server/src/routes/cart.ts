import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { optionalCustomerAuth, CustomerAuthRequest } from '../middleware/customerAuth.js';

const router = Router();

// Helper to find or create cart
const getOrCreateCart = async (req: CustomerAuthRequest) => {
  const customerId = req.customer?.customerId;
  const guestToken = (req.headers['x-guest-token'] as string) || (req.query.guestToken as string);

  if (customerId) {
    let cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                sellingPrice: true,
                originalPrice: true,
                primaryImage: true,
                stockQuantity: true,
                stockStatus: true,
                isArchived: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  sku: true,
                  sellingPrice: true,
                  originalPrice: true,
                  primaryImage: true,
                  stockQuantity: true,
                  stockStatus: true,
                  isArchived: true,
                },
              },
            },
          },
        },
      });
    }
    return cart;
  }

  // Guest Cart
  if (guestToken) {
    let cart = await prisma.cart.findUnique({
      where: { guestToken },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                sellingPrice: true,
                originalPrice: true,
                primaryImage: true,
                stockQuantity: true,
                stockStatus: true,
                isArchived: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { guestToken },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  sku: true,
                  sellingPrice: true,
                  originalPrice: true,
                  primaryImage: true,
                  stockQuantity: true,
                  stockStatus: true,
                  isArchived: true,
                },
              },
            },
          },
        },
      });
    }
    return cart;
  }

  return null;
};

// 1. GET /api/cart
router.get('/', optionalCustomerAuth, async (req: CustomerAuthRequest, res: Response) => {
  try {
    const cart = await getOrCreateCart(req);

    if (!cart) {
      res.json({
        success: true,
        cart: {
          items: [],
          itemCount: 0,
          subtotal: 0,
          estimatedTax: 0,
          estimatedShipping: 0,
          total: 0,
        },
      });
      return;
    }

    // Filter valid non-archived items and calculate totals authoritatively
    let subtotal = 0;
    let itemCount = 0;
    const validatedItems = [];

    for (const item of cart.items) {
      if (!item.product || item.product.isArchived) continue;

      const unitPrice = item.product.sellingPrice;
      const quantity = Math.min(item.quantity, Math.max(1, item.product.stockQuantity));
      const totalPrice = unitPrice * quantity;

      subtotal += totalPrice;
      itemCount += quantity;

      validatedItems.push({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku,
        primaryImage: item.product.primaryImage,
        unitPrice,
        originalPrice: item.product.originalPrice,
        quantity,
        totalPrice,
        stockQuantity: item.product.stockQuantity,
        stockStatus: item.product.stockStatus,
        isAvailable: item.product.stockQuantity > 0,
      });
    }

    const estimatedTax = Math.round(subtotal * 0.18); // 18% GST estimate
    const estimatedShipping = subtotal > 50000 || subtotal === 0 ? 0 : 499;
    const total = subtotal + estimatedTax + estimatedShipping;

    res.json({
      success: true,
      cart: {
        id: cart.id,
        items: validatedItems,
        itemCount,
        subtotal,
        estimatedTax,
        estimatedShipping,
        total,
      },
    });
  } catch (error: any) {
    console.error('Cart Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve shopping cart.' });
  }
});

// 2. POST /api/cart/items - Add item to cart
router.post('/items', optionalCustomerAuth, async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity <= 0) {
      res.status(400).json({ success: false, message: 'Valid productId and positive quantity required.' });
      return;
    }

    // Verify product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.isArchived) {
      res.status(404).json({ success: false, message: 'Product is unavailable or does not exist.' });
      return;
    }

    if (product.stockQuantity <= 0) {
      res.status(400).json({
        success: false,
        message: `Sorry, "${product.name}" is currently out of stock.`,
      });
      return;
    }

    let cart = await getOrCreateCart(req);
    if (!cart) {
      res.status(400).json({ success: false, message: 'Cart session could not be established.' });
      return;
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const requestedTotal = (existingItem?.quantity || 0) + quantity;
    if (requestedTotal > product.stockQuantity) {
      res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} unit(s) available in stock. You already have ${existingItem?.quantity || 0} in your cart.`,
      });
      return;
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: requestedTotal },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    res.json({
      success: true,
      message: `Added ${product.name} to cart.`,
    });
  } catch (error: any) {
    console.error('Cart Add Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
});

// 3. PUT /api/cart/items/:id - Update item quantity
router.put('/items/:id', optionalCustomerAuth, async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      res.status(400).json({ success: false, message: 'Invalid quantity provided.' });
      return;
    }

    const cart = await getOrCreateCart(req);
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found.' });
      return;
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id, cartId: cart.id },
      include: { product: true },
    });

    if (!cartItem) {
      res.status(404).json({ success: false, message: 'Cart item not found.' });
      return;
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id } });
      res.json({ success: true, message: 'Item removed from cart.' });
      return;
    }

    if (quantity > cartItem.product.stockQuantity) {
      res.status(400).json({
        success: false,
        message: `Only ${cartItem.product.stockQuantity} units available in stock.`,
      });
      return;
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    res.json({
      success: true,
      message: 'Cart updated.',
      item: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update cart item.' });
  }
});

// 4. DELETE /api/cart/items/:id - Remove item
router.delete('/items/:id', optionalCustomerAuth, async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cart = await getOrCreateCart(req);
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found.' });
      return;
    }

    await prisma.cartItem.deleteMany({
      where: { id, cartId: cart.id },
    });

    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to remove cart item.' });
  }
});

// 5. DELETE /api/cart - Clear entire cart
router.delete('/', optionalCustomerAuth, async (req: CustomerAuthRequest, res: Response) => {
  try {
    const cart = await getOrCreateCart(req);
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
    res.json({ success: true, message: 'Cart cleared successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
});

export default router;

