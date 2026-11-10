import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET all categories (with product count)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    res.json({
      success: true,
      data: categories.map((cat) => ({
        ...cat,
        productCount: cat._count.products,
      })),
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// GET category by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          take: 8,
          include: { brand: true },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      data: {
        ...category,
        productCount: category._count.products,
      },
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
});

export default router;
