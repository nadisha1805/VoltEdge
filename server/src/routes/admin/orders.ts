import { Router, Response } from 'express';
import { prisma } from '../../prisma.js';
import { verifyAdminToken, requireRole } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

// GET /api/admin/orders
router.get('/', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      orderStatus,
      paymentStatus,
      startDate,
      endDate,
      page = '1',
      limit = '10',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (orderStatus && typeof orderStatus === 'string' && orderStatus !== 'all') {
      where.orderStatus = orderStatus;
    }

    if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { orderNumber: { contains: term } },
        { customerName: { contains: term } },
        { customerEmail: { contains: term } },
        { customerPhone: { contains: term } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: orders,
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
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// GET /api/admin/orders/:id
router.get('/:id', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                primaryImage: true,
                stockQuantity: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            adminUser: {
              select: { id: true, fullName: true, role: true },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch(
  '/:id/status',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { orderStatus, paymentStatus, comment } = req.body;

      const order = await prisma.order.findFirst({
        where: { OR: [{ id }, { orderNumber: id }] },
        include: { items: true },
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const updateData: any = {};
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;

      const updated = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id: order.id },
          data: updateData,
        });

        // Add to OrderStatusHistory
        if (orderStatus && orderStatus !== order.orderStatus) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              status: orderStatus,
              comment: comment ? comment.trim() : `Order status changed to ${orderStatus}`,
              adminUserId: req.admin?.id,
              updatedBy: req.admin?.fullName || 'Staff Member',
            },
          });
        }

        return ord;
      });

      await logActivity(
        req.admin,
        'STATUS_CHANGE',
        'ORDERS',
        `Updated order ${order.orderNumber} status to ${orderStatus || order.orderStatus} (Payment: ${paymentStatus || order.paymentStatus})`,
        { orderId: order.id, orderNumber: order.orderNumber, orderStatus, paymentStatus, comment },
        req
      );

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: updated,
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to update order status' });
    }
  }
);

export default router;

