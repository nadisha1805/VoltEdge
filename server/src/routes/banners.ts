import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET active banners
router.get('/', async (_req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch banners' });
  }
});

export default router;

