import { Router, Response } from 'express';
import { prisma } from '../../prisma.js';
import { verifyAdminToken, requireRole } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

// GET /api/admin/brands
router.get('/', verifyAdminToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    res.json({
      success: true,
      data: brands.map((b) => ({
        ...b,
        productCount: b._count.products,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch brands' });
  }
});

// POST /api/admin/brands
router.post(
  '/',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, slug, logoUrl, description, featured = false } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'Brand name is required' });
      }

      let finalSlug = slug
        ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const existing = await prisma.brand.findUnique({ where: { slug: finalSlug } });
      if (existing) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }

      const brand = await prisma.brand.create({
        data: {
          name: name.trim(),
          slug: finalSlug,
          logoUrl: logoUrl || null,
          description: description || null,
          featured: Boolean(featured),
        },
      });

      await logActivity(
        req.admin,
        'CREATE',
        'BRANDS',
        `Brand created: "${brand.name}"`,
        { brandId: brand.id },
        req
      );

      res.status(201).json({
        success: true,
        message: 'Brand created successfully',
        data: brand,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create brand' });
    }
  }
);

// PUT /api/admin/brands/:id
router.put(
  '/:id',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, slug, logoUrl, description, featured, isArchived } = req.body;

      const existing = await prisma.brand.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (slug !== undefined) updateData.slug = slug.trim().toLowerCase();
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
      if (description !== undefined) updateData.description = description;
      if (featured !== undefined) updateData.featured = Boolean(featured);
      if (isArchived !== undefined) updateData.isArchived = Boolean(isArchived);

      const updated = await prisma.brand.update({
        where: { id },
        data: updateData,
      });

      await logActivity(
        req.admin,
        'UPDATE',
        'BRANDS',
        `Brand updated: "${updated.name}"`,
        { brandId: updated.id },
        req
      );

      res.json({
        success: true,
        message: 'Brand updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update brand' });
    }
  }
);

// DELETE /api/admin/brands/:id
router.delete(
  '/:id',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const brand = await prisma.brand.findUnique({
        where: { id },
        include: {
          _count: { select: { products: true } },
        },
      });

      if (!brand) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }

      if (brand._count.products > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete brand "${brand.name}" because ${brand._count.products} products are associated with it. Please reassign those products first or archive the brand.`,
          productCount: brand._count.products,
        });
      }

      await prisma.brand.delete({ where: { id } });

      await logActivity(
        req.admin,
        'DELETE',
        'BRANDS',
        `Brand deleted: "${brand.name}"`,
        { brandId: id },
        req
      );

      res.json({ success: true, message: 'Brand deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete brand' });
    }
  }
);

export default router;

