import { Router, Response } from 'express';
import { prisma } from '../../prisma.js';
import { verifyAdminToken, requireRole } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

// GET /api/admin/categories
router.get('/', verifyAdminToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });

    res.json({
      success: true,
      data: categories.map((c) => ({
        ...c,
        productCount: c._count.products,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// POST /api/admin/categories
router.post(
  '/',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, slug, description, icon, imageUrl, featured = false, displayOrder = 0, parentId } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
      }

      let finalSlug = slug
        ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const existingSlug = await prisma.category.findUnique({ where: { slug: finalSlug } });
      if (existingSlug) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }

      const category = await prisma.category.create({
        data: {
          name: name.trim(),
          slug: finalSlug,
          description: description || null,
          icon: icon || 'Folder',
          imageUrl: imageUrl || null,
          featured: Boolean(featured),
          displayOrder: parseInt(displayOrder, 10) || 0,
          parentId: parentId || null,
        },
        include: { parent: true },
      });

      await logActivity(
        req.admin,
        'CREATE',
        'CATEGORIES',
        `Category created: "${category.name}"`,
        { categoryId: category.id },
        req
      );

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create category' });
    }
  }
);

// PUT /api/admin/categories/:id
router.put(
  '/:id',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, slug, description, icon, imageUrl, featured, displayOrder, parentId, isArchived } = req.body;

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      // Prevent self-referencing hierarchy
      if (parentId && parentId === id) {
        return res.status(400).json({ success: false, message: 'Category cannot be its own parent' });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (slug !== undefined) updateData.slug = slug.trim().toLowerCase();
      if (description !== undefined) updateData.description = description;
      if (icon !== undefined) updateData.icon = icon;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (featured !== undefined) updateData.featured = Boolean(featured);
      if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder, 10);
      if (parentId !== undefined) updateData.parentId = parentId || null;
      if (isArchived !== undefined) updateData.isArchived = Boolean(isArchived);

      const updated = await prisma.category.update({
        where: { id },
        data: updateData,
        include: { parent: true },
      });

      await logActivity(
        req.admin,
        'UPDATE',
        'CATEGORIES',
        `Category updated: "${updated.name}"`,
        { categoryId: updated.id },
        req
      );

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update category' });
    }
  }
);

// DELETE /api/admin/categories/:id (With product safeguard)
router.delete(
  '/:id',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { reassignToCategoryId } = req.body || {};

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: { select: { products: true, children: true } },
        },
      });

      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      // Check if products still reference this category
      if (category._count.products > 0) {
        if (!reassignToCategoryId) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete category "${category.name}" because it contains ${category._count.products} active product(s). Please reassign products to another category first or specify reassignToCategoryId.`,
            productCount: category._count.products,
          });
        }

        // Reassign products safely in a transaction
        await prisma.$transaction(async (tx) => {
          await tx.product.updateMany({
            where: { categoryId: id },
            data: { categoryId: reassignToCategoryId },
          });

          // Disconnect children
          await tx.category.updateMany({
            where: { parentId: id },
            data: { parentId: null },
          });

          await tx.category.delete({ where: { id } });
        });

        await logActivity(
          req.admin,
          'DELETE',
          'CATEGORIES',
          `Category deleted: "${category.name}" with products reassigned to ${reassignToCategoryId}`,
          { categoryId: id },
          req
        );

        return res.json({
          success: true,
          message: `Category "${category.name}" deleted and ${category._count.products} products safely reassigned.`,
        });
      }

      // If category has children, detach parentId
      if (category._count.children > 0) {
        await prisma.category.updateMany({
          where: { parentId: id },
          data: { parentId: null },
        });
      }

      await prisma.category.delete({ where: { id } });

      await logActivity(
        req.admin,
        'DELETE',
        'CATEGORIES',
        `Category permanently deleted: "${category.name}"`,
        { categoryId: id },
        req
      );

      res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
  }
);

export default router;

