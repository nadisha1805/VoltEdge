import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET testimonials
router.get('/', async (_req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    res.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch testimonials' });
  }
});

export default router;

