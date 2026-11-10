import { Router, Response } from 'express';
import { prisma } from '../../prisma.js';
import { verifyAdminToken, requireRole } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

// GET /api/admin/enquiries
router.get('/', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search, page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { email: { contains: term } },
        { subject: { contains: term } },
        { message: { contains: term } },
      ];
    }

    const [enquiries, totalCount] = await Promise.all([
      prisma.contactEnquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.contactEnquiry.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: enquiries,
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
    res.status(500).json({ success: false, message: 'Failed to fetch contact enquiries' });
  }
});

// PATCH /api/admin/enquiries/:id/status
router.patch(
  '/:id/status',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      const enquiry = await prisma.contactEnquiry.findUnique({ where: { id } });
      if (!enquiry) {
        return res.status(404).json({ success: false, message: 'Enquiry not found' });
      }

      const updateData: any = {};
      if (status) {
        updateData.status = status;
        if (status === 'RESOLVED') {
          updateData.respondedAt = new Date();
        }
      }
      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes;
      }

      const updated = await prisma.contactEnquiry.update({
        where: { id },
        data: updateData,
      });

      await logActivity(
        req.admin,
        'STATUS_CHANGE',
        'ENQUIRIES',
        `Updated enquiry status to "${status}" for ${enquiry.name} (${enquiry.email})`,
        { enquiryId: id, status, adminNotes },
        req
      );

      res.json({
        success: true,
        message: 'Enquiry updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update enquiry' });
    }
  }
);

// DELETE /api/admin/enquiries/:id
router.delete(
  '/:id',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.contactEnquiry.delete({ where: { id } });

      await logActivity(
        req.admin,
        'DELETE',
        'ENQUIRIES',
        `Deleted enquiry record (ID: ${id})`,
        { enquiryId: id },
        req
      );

      res.json({ success: true, message: 'Enquiry deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete enquiry' });
    }
  }
);

export default router;

