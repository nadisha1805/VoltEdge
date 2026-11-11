import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireCustomerAuth, CustomerAuthRequest } from '../middleware/customerAuth.js';

const router = Router();

// Helper to update product rating aggregate
const updateProductRating = async (productId: string) => {
  const reviews = await prisma.productReview.findMany({
    where: { productId, status: 'APPROVED' },
    select: { rating: true },
  });

  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
    : 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: avgRating,
      reviewCount,
    },
  });
};

// 1. GET /api/products/:productId/reviews - Public product reviews
router.get('/:productId/reviews', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.productReview.findMany({
      where: { productId, status: 'APPROVED' },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        isVerifiedPurchase: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      reviews,
      count: reviews.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// 2. POST /api/products/:productId/reviews - Customer submits review
router.post('/:productId/reviews', requireCustomerAuth, async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const customerId = req.customer!.customerId;

    if (!rating || rating < 1 || rating > 5 || !comment) {
      res.status(400).json({
        success: false,
        message: 'Rating (between 1 and 5) and a written review comment are required.',
      });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.isArchived) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Check if customer has a confirmed/delivered order containing this product for Verified Purchase badge
    const verifiedOrder = await prisma.order.findFirst({
      where: {
        customerId,
        orderStatus: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        items: {
          some: { productId },
        },
      },
    });

    const isVerifiedPurchase = !!verifiedOrder;

    // Check if already reviewed (prevent duplicate review for same customer & product)
    const existing = await prisma.productReview.findUnique({
      where: {
        productId_customerId: {
          productId,
          customerId,
        },
      },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product. You may edit your existing review.',
      });
      return;
    }

    const review = await prisma.productReview.create({
      data: {
        productId,
        customerId,
        rating: Math.round(rating),
        title: title ? title.trim() : null,
        comment: comment.trim(),
        isVerifiedPurchase,
        status: 'APPROVED',
      },
    });

    // Update product rating aggregate
    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your product review has been submitted successfully.',
      review,
    });
  } catch (error: any) {
    console.error('Review Submission Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// 3. PUT /api/reviews/:id - Edit existing review
router.put('/:id', requireCustomerAuth, async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const customerId = req.customer!.customerId;

    const existing = await prisma.productReview.findFirst({
      where: { id, customerId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Review not found or unauthorized.' });
      return;
    }

    const updated = await prisma.productReview.update({
      where: { id },
      data: {
        rating: rating !== undefined ? Math.round(rating) : existing.rating,
        title: title !== undefined ? title : existing.title,
        comment: comment !== undefined ? comment : existing.comment,
      },
    });

    await updateProductRating(existing.productId);

    res.json({
      success: true,
      message: 'Review updated successfully.',
      review: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
});

// 4. DELETE /api/reviews/:id - Delete customer's review
router.delete('/:id', requireCustomerAuth, async (req: CustomerAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.customer!.customerId;

    const existing = await prisma.productReview.findFirst({
      where: { id, customerId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Review not found or unauthorized.' });
      return;
    }

    await prisma.productReview.delete({ where: { id } });
    await updateProductRating(existing.productId);

    res.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

export default router;

