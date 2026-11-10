import { Router, Response } from 'express';
import { prisma } from '../../prisma.js';
import { verifyAdminToken, requireRole } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

// GET /api/admin/coupons
router.get('/', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, isActive } = req.query;

    const where: any = { isArchived: false };

    if (isActive !== undefined && isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { code: { contains: term } },
        { description: { contains: term } },
      ];
    }

    const coupons = await prisma.coupon.findMany({
      where,
      include: {
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
});

// POST /api/admin/coupons
router.post(
  '/',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        code,
        description,
        discountType = 'PERCENTAGE',
        discountValue,
        minOrderAmount = 0,
        maxDiscount,
        usageLimit,
        perCustomerLimit = 1,
        startDate,
        expiryDate,
        isActive = true,
      } = req.body;

      if (!code || !description || discountValue === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Code, description, and discount value are required.',
        });
      }

      const cleanCode = code.trim().toUpperCase();
      const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
      if (existing) {
        return res.status(400).json({ success: false, message: `Coupon code "${cleanCode}" already exists.` });
      }

      const coupon = await prisma.coupon.create({
        data: {
          code: cleanCode,
          description: description.trim(),
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderAmount: parseFloat(minOrderAmount) || 0,
          maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
          usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
          perCustomerLimit: parseInt(perCustomerLimit, 10) || 1,
          startDate: startDate ? new Date(startDate) : new Date(),
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          isActive: Boolean(isActive),
        },
      });

      await logActivity(
        req.admin,
        'CREATE',
        'COUPONS',
        `Coupon created: "${coupon.code}" (${coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} off)`,
        { couponId: coupon.id, code: coupon.code },
        req
      );

      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create coupon' });
    }
  }
);

// PUT /api/admin/coupons/:id
router.put(
  '/:id',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const {
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        perCustomerLimit,
        startDate,
        expiryDate,
        isActive,
        isArchived,
      } = req.body;

      const existing = await prisma.coupon.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      const updateData: any = {};
      if (code !== undefined) {
        const cleanCode = code.trim().toUpperCase();
        if (cleanCode !== existing.code) {
          const codeCheck = await prisma.coupon.findUnique({ where: { code: cleanCode } });
          if (codeCheck) {
            return res.status(400).json({ success: false, message: `Coupon code "${cleanCode}" already exists.` });
          }
        }
        updateData.code = cleanCode;
      }

      if (description !== undefined) updateData.description = description.trim();
      if (discountType !== undefined) updateData.discountType = discountType;
      if (discountValue !== undefined) updateData.discountValue = parseFloat(discountValue);
      if (minOrderAmount !== undefined) updateData.minOrderAmount = parseFloat(minOrderAmount);
      if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null;
      if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit, 10) : null;
      if (perCustomerLimit !== undefined) updateData.perCustomerLimit = parseInt(perCustomerLimit, 10);
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);
      if (isArchived !== undefined) updateData.isArchived = Boolean(isArchived);

      const updated = await prisma.coupon.update({
        where: { id },
        data: updateData,
      });

      await logActivity(
        req.admin,
        'UPDATE',
        'COUPONS',
        `Coupon updated: "${updated.code}"`,
        { couponId: updated.id },
        req
      );

      res.json({
        success: true,
        message: 'Coupon updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update coupon' });
    }
  }
);

// DELETE /api/admin/coupons/:id
router.delete(
  '/:id',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const coupon = await prisma.coupon.findUnique({
        where: { id },
        include: { _count: { select: { usages: true } } },
      });

      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      // If already used, soft-archive
      if (coupon._count.usages > 0) {
        await prisma.coupon.update({
          where: { id },
          data: { isArchived: true, isActive: false },
        });

        await logActivity(
          req.admin,
          'ARCHIVE',
          'COUPONS',
          `Coupon archived due to redemption history: "${coupon.code}"`,
          { couponId: id },
          req
        );

        return res.json({
          success: true,
          message: 'Coupon has historical redemption records and was archived.',
        });
      }

      await prisma.coupon.delete({ where: { id } });

      await logActivity(
        req.admin,
        'DELETE',
        'COUPONS',
        `Coupon deleted: "${coupon.code}"`,
        { couponId: id },
        req
      );

      res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete coupon' });
    }
  }
);

export default router;

