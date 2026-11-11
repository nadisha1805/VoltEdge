import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireCustomerAuth, CustomerAuthRequest } from '../middleware/customerAuth.js';

const router = Router();

// Wishlist requires customer authentication
router.use(requireCustomerAuth);

// Helper to get or create wishlist
const getOrCreateWishlist = async (customerId: string) => {
  let wishlist = await prisma.wishlist.findUnique({
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
              rating: true,
              reviewCount: true,
              warrantyInfo: true,
              isArchived: true,
            },
          },
        },
      },
    },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
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
                rating: true,
                reviewCount: true,
                warrantyInfo: true,
                isArchived: true,
              },
            },
          },
        },
      },
    });
  }

  return wishlist;
};

// 1. GET /api/wishlist
router.get('/', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const wishlist = await getOrCreateWishlist(req.customer!.customerId);

    const items = wishlist.items
      .filter(item => item.product && !item.product.isArchived)
      .map(item => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        addedAt: item.createdAt,
      }));

    res.json({
      success: true,
      wishlist: {
        id: wishlist.id,
        items,
        count: items.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve wishlist.' });
  }
});

// 2. POST /api/wishlist - Add product to wishlist
router.post('/', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.isArchived) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const wishlist = await getOrCreateWishlist(req.customer!.customerId);

    // Prevent duplicate entries
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      res.json({
        success: true,
        message: 'Product is already in your wishlist.',
      });
      return;
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    res.status(201).json({
      success: true,
      message: `Added ${product.name} to wishlist.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add item to wishlist.' });
  }
});

// 3. DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete('/:productId', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const wishlist = await getOrCreateWishlist(req.customer!.customerId);

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to remove item from wishlist.' });
  }
});

// 4. POST /api/wishlist/move-to-cart - Move item from wishlist to cart
router.post('/move-to-cart', async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    const customerId = req.customer!.customerId;

    // Check stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.isArchived || product.stockQuantity <= 0) {
      res.status(400).json({
        success: false,
        message: 'Product is currently out of stock and cannot be moved to cart.',
      });
      return;
    }

    let cart = await prisma.cart.findUnique({
      where: { customerId },
    });

    if (!cart) {
      cart = await prisma.cart.create({ data: { customerId } });
    }

    const wishlist = await getOrCreateWishlist(customerId);

    // Upsert into cart & delete from wishlist in transaction
    await prisma.$transaction([
      prisma.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
        update: {
          quantity: { increment: 1 },
        },
        create: {
          cartId: cart.id,
          productId,
          quantity: 1,
        },
      }),
      prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: wishlist.id,
          productId,
        },
      }),
    ]);

    res.json({
      success: true,
      message: `Moved ${product.name} to cart.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to move item to cart.' });
  }
});

export default router;

