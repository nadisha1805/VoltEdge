import { Router, Response } from 'express';
import { prisma } from '../../prisma.js';
import { verifyAdminToken, requireRole } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

// GET /api/admin/customers
router.get('/', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      status,
      includeArchived = 'false',
      sort = 'spent-desc',
      page = '1',
      limit = '10',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (includeArchived !== 'true') {
      where.isArchived = false;
    }

    if (status && typeof status === 'string' && status !== 'all') {
      where.status = status;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { firstName: { contains: term } },
        { lastName: { contains: term } },
        { email: { contains: term } },
        { phone: { contains: term } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'spent-desc':
        orderBy = { totalSpent: 'desc' };
        break;
      case 'spent-asc':
        orderBy = { totalSpent: 'asc' };
        break;
      case 'orders-desc':
        orderBy = { totalOrders: 'desc' };
        break;
      case 'name-asc':
        orderBy = { firstName: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          addresses: true,
          _count: { select: { orders: true } },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.customer.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: customers,
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
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
});

// GET /api/admin/customers/:id
router.get('/:id', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer profile' });
  }
});

// PUT /api/admin/customers/:id
router.put(
  '/:id',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, phone, status, notes, isArchived } = req.body;

      const customer = await prisma.customer.findUnique({ where: { id } });
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName.trim();
      if (lastName !== undefined) updateData.lastName = lastName.trim();
      if (phone !== undefined) updateData.phone = phone.trim();
      if (status !== undefined) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (isArchived !== undefined) updateData.isArchived = Boolean(isArchived);

      const updated = await prisma.customer.update({
        where: { id },
        data: updateData,
        include: { addresses: true },
      });

      await logActivity(
        req.admin,
        'UPDATE',
        'CUSTOMERS',
        `Updated customer profile: ${updated.firstName} ${updated.lastName} (${updated.email})`,
        { customerId: id, status: updated.status },
        req
      );

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update customer' });
    }
  }
);

export default router;

