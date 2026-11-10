import { Router, Response } from 'express';
import { prisma } from '../../prisma.js';
import { verifyAdminToken, requireRole } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

// GET /api/admin/settings
router.get('/', verifyAdminToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    let settings = await prisma.showroomSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.showroomSettings.create({
        data: { id: 'default' },
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings
router.put(
  '/',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        storeName,
        tagline,
        email,
        phone,
        address,
        businessHours,
        currency,
        currencySymbol,
        lowStockThreshold,
        taxRate,
      } = req.body;

      const updated = await prisma.showroomSettings.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          storeName: storeName || 'VOLTEDGE Electronics',
          tagline: tagline || 'Powering Your Digital World.',
          email: email || 'support@voltedge-electronics.com',
          phone: phone || '+91 98765 43210',
          address: address || 'Plot 42, Digital Corridor, Cyber City, Bangalore - 560100',
          businessHours: businessHours || 'Mon - Sat: 9:30 AM - 9:00 PM | Sun: 10:00 AM - 7:00 PM',
          currency: currency || 'INR',
          currencySymbol: currencySymbol || '₹',
          lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
          taxRate: parseFloat(taxRate) || 18.0,
        },
        update: {
          storeName,
          tagline,
          email,
          phone,
          address,
          businessHours,
          currency,
          currencySymbol,
          lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold, 10) : undefined,
          taxRate: taxRate !== undefined ? parseFloat(taxRate) : undefined,
        },
      });

      await logActivity(
        req.admin,
        'UPDATE',
        'SETTINGS',
        'Updated showroom configuration and operational parameters',
        { settings: updated },
        req
      );

      res.json({
        success: true,
        message: 'Showroom settings updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update settings' });
    }
  }
);

export default router;

