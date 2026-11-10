import { Router, Response } from 'express';
import { prisma } from '../../prisma.js';
import { verifyAdminToken } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';

const router = Router();

// GET /api/admin/dashboard/overview
router.get('/overview', verifyAdminToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await prisma.showroomSettings.findUnique({ where: { id: 'default' } });
    const lowStockThreshold = settings?.lowStockThreshold ?? 5;

    const [
      totalProducts,
      totalCategories,
      totalBrands,
      totalCustomers,
      totalOrders,
      lowStockProducts,
      outOfStockProducts,
      pendingEnquiries,
      paidOrdersAggregate,
    ] = await Promise.all([
      prisma.product.count({ where: { isArchived: false } }),
      prisma.category.count({ where: { isArchived: false } }),
      prisma.brand.count({ where: { isArchived: false } }),
      prisma.customer.count({ where: { isArchived: false } }),
      prisma.order.count(),
      prisma.product.count({
        where: {
          isArchived: false,
          stockQuantity: { gt: 0, lte: lowStockThreshold },
        },
      }),
      prisma.product.count({
        where: {
          isArchived: false,
          stockQuantity: { lte: 0 },
        },
      }),
      prisma.contactEnquiry.count({ where: { status: 'NEW' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'PAID' },
      }),
    ]);

    const totalRevenue = paidOrdersAggregate._sum.totalAmount || 0;

    res.json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        totalBrands,
        totalCustomers,
        totalOrders,
        totalRevenue,
        lowStockProducts,
        outOfStockProducts,
        pendingEnquiries,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard overview metrics.' });
  }
});

// GET /api/admin/dashboard/analytics
router.get('/analytics', verifyAdminToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await prisma.showroomSettings.findUnique({ where: { id: 'default' } });
    const lowStockThreshold = settings?.lowStockThreshold ?? 5;

    // 1. Category Distribution
    const categories = await prisma.category.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: true } },
      },
      orderBy: { displayOrder: 'asc' },
    });

    const categoryDistribution = categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      count: c._count.products,
    }));

    // 2. Inventory Status Breakdown
    const [inStockCount, lowStockCount, outOfStockCount] = await Promise.all([
      prisma.product.count({
        where: { isArchived: false, stockQuantity: { gt: lowStockThreshold } },
      }),
      prisma.product.count({
        where: { isArchived: false, stockQuantity: { gt: 0, lte: lowStockThreshold } },
      }),
      prisma.product.count({
        where: { isArchived: false, stockQuantity: { lte: 0 } },
      }),
    ]);

    const inventoryStatus = [
      { status: 'In Stock', count: inStockCount, color: '#10B981' },
      { status: 'Low Stock', count: lowStockCount, color: '#F59E0B' },
      { status: 'Out of Stock', count: outOfStockCount, color: '#EF4444' },
    ];

    // 3. Orders & Revenue History (actual database orders)
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        paymentStatus: true,
        orderStatus: true,
        createdAt: true,
      },
    });

    // 4. Top Selling Products
    // Aggregate by order items
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sellingPrice: true,
            primaryImage: true,
            stockQuantity: true,
          },
        },
      },
    });

    const productSalesMap = new Map<string, { product: any; totalQty: number; totalSales: number }>();
    for (const item of orderItems) {
      if (!item.productId) continue;
      const existing = productSalesMap.get(item.productId);
      if (existing) {
        existing.totalQty += item.quantity;
        existing.totalSales += item.totalPrice;
      } else {
        productSalesMap.set(item.productId, {
          product: item.product,
          totalQty: item.quantity,
          totalSales: item.totalPrice,
        });
      }
    }

    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5)
      .map((entry) => ({
        id: entry.product?.id,
        name: entry.product?.name,
        price: entry.product?.sellingPrice,
        image: entry.product?.primaryImage,
        unitsSold: entry.totalQty,
        revenue: entry.totalSales,
        currentStock: entry.product?.stockQuantity,
      }));

    res.json({
      success: true,
      data: {
        categoryDistribution,
        inventoryStatus,
        recentOrders,
        topSellingProducts,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics data.' });
  }
});

// GET /api/admin/dashboard/recent-activity
router.get('/recent-activity', verifyAdminToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const activities = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        adminUser: {
          select: {
            id: true,
            fullName: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recent activity logs.' });
  }
});

export default router;

