import { Router, Response } from 'express';
import { prisma } from '../../prisma.js';
import { verifyAdminToken, requireRole } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

// GET /api/admin/newsletter (List with search and pagination)
router.get('/', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, isActive, page = '1', limit = '15' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (isActive !== undefined && isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      where.email = { contains: search.trim().toLowerCase() };
    }

    const [subscribers, totalCount] = await Promise.all([
      prisma.newsletterSubscription.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.newsletterSubscription.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: subscribers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscribers' });
  }
});

// GET /api/admin/newsletter/export (CSV export)
router.get('/export', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subscribers = await prisma.newsletterSubscription.findMany({
      orderBy: { subscribedAt: 'desc' },
    });

    let csvContent = 'ID,Email,Status,Subscribed Date\n';
    subscribers.forEach((sub) => {
      const date = sub.subscribedAt.toISOString().split('T')[0];
      const status = sub.isActive ? 'Active' : 'Unsubscribed';
      csvContent += `"${sub.id}","${sub.email}","${status}","${date}"\n`;
    });

    await logActivity(
      req.admin,
      'EXPORT',
      'NEWSLETTER',
      `Exported ${subscribers.length} newsletter subscribers to CSV`,
      { count: subscribers.length },
      req
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=voltedge-newsletter-subscribers.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export subscriber data' });
  }
});

// PATCH /api/admin/newsletter/:id/status (Toggle Subscription status)
router.patch(
  '/:id/status',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const updated = await prisma.newsletterSubscription.update({
        where: { id },
        data: { isActive: Boolean(isActive) },
      });

      await logActivity(
        req.admin,
        'UPDATE',
        'NEWSLETTER',
        `Updated subscription status for ${updated.email} to ${updated.isActive ? 'Active' : 'Unsubscribed'}`,
        { id, isActive: updated.isActive },
        req
      );

      res.json({
        success: true,
        message: 'Subscriber status updated successfully',
        data: updated,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update subscriber status' });
    }
  }
);

// DELETE /api/admin/newsletter/:id
router.delete(
  '/:id',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.newsletterSubscription.delete({ where: { id } });

      await logActivity(
        req.admin,
        'DELETE',
        'NEWSLETTER',
        `Deleted subscriber record (ID: ${id})`,
        { id },
        req
      );

      res.json({ success: true, message: 'Subscriber removed successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to remove subscriber' });
    }
  }
);

export default router;

