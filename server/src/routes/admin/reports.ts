import { Router, Response } from 'express';
import { prisma } from '../../prisma.js';
import { verifyAdminToken, requireRole } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

function getDateRange(range?: string, start?: string, end?: string): { gte?: Date; lte?: Date } {
  const now = new Date();
  if (range === 'today') {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { gte: todayStart };
  }
  if (range === '7d') {
    const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { gte: d };
  }
  if (range === '30d') {
    const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { gte: d };
  }
  if (range === 'month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return { gte: monthStart };
  }
  if (range === 'custom' && (start || end)) {
    const filter: { gte?: Date; lte?: Date } = {};
    if (start) filter.gte = new Date(start);
    if (end) filter.lte = new Date(end);
    return filter;
  }
  return {};
}

// GET /api/admin/reports/summary
router.get('/summary', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { range, start, end } = req.query;
    const dateFilter = getDateRange(range as string, start as string, end as string);

    const orderWhere: any = {};
    if (dateFilter.gte || dateFilter.lte) {
      orderWhere.createdAt = dateFilter;
    }

    const [
      totalOrders,
      paidOrdersAggregate,
      productsCount,
      customersCount,
      lowStockCount,
      outOfStockCount,
    ] = await Promise.all([
      prisma.order.count({ where: orderWhere }),
      prisma.order.aggregate({
        where: { ...orderWhere, paymentStatus: 'PAID' },
        _sum: { totalAmount: true, discountAmount: true, taxAmount: true },
        _count: true,
      }),
      prisma.product.count({ where: { isArchived: false } }),
      prisma.customer.count({ where: { isArchived: false } }),
      prisma.product.count({ where: { isArchived: false, stockQuantity: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { isArchived: false, stockQuantity: { lte: 0 } } }),
    ]);

    const grossSales = paidOrdersAggregate._sum.totalAmount || 0;
    const totalDiscounts = paidOrdersAggregate._sum.discountAmount || 0;
    const paidCount = paidOrdersAggregate._count || 0;
    const avgOrderValue = paidCount > 0 ? Math.round((grossSales / paidCount) * 100) / 100 : 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        paidOrdersCount: paidCount,
        grossSales,
        totalDiscounts,
        avgOrderValue,
        productsCount,
        customersCount,
        lowStockCount,
        outOfStockCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports summary' });
  }
});

// GET /api/admin/reports/products
router.get('/products', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { format } = req.query;

    const products = await prisma.product.findMany({
      where: { isArchived: false },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { stockQuantity: 'asc' },
    });

    const reportData = products.map((p) => {
      const cost = p.costPrice > 0 ? p.costPrice : Math.round(p.sellingPrice * 0.72);
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category.name,
        brand: p.brand.name,
        sellingPrice: p.sellingPrice,
        costPrice: cost,
        stockQuantity: p.stockQuantity,
        stockStatus: p.stockStatus,
        inventoryCostValuation: cost * p.stockQuantity,
        retailValuation: p.sellingPrice * p.stockQuantity,
      };
    });

    if (format === 'csv') {
      let csv = 'SKU,Product Name,Category,Brand,Selling Price,Cost Price,Stock,Status,Inventory Valuation\n';
      reportData.forEach((r) => {
        csv += `"${r.sku}","${r.name.replace(/"/g, '""')}","${r.category}","${r.brand}",${r.sellingPrice},${r.costPrice},${r.stockQuantity},"${r.stockStatus}",${r.inventoryCostValuation}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=voltedge-product-report.csv');
      return res.status(200).send(csv);
    }

    res.json({ success: true, data: reportData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate product report' });
  }
});

// GET /api/admin/reports/inventory
router.get('/inventory', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, format } = req.query; // type: 'all' | 'low' | 'out'

    const where: any = { isArchived: false };
    if (type === 'low') {
      where.stockQuantity = { gt: 0, lte: 5 };
    } else if (type === 'out') {
      where.stockQuantity = { lte: 0 };
    }

    const items = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
      orderBy: { stockQuantity: 'asc' },
    });

    const reportData = items.map((p) => {
      const cost = p.costPrice > 0 ? p.costPrice : Math.round(p.sellingPrice * 0.72);
      return {
        sku: p.sku,
        name: p.name,
        category: p.category.name,
        brand: p.brand.name,
        stockQuantity: p.stockQuantity,
        costPrice: cost,
        sellingPrice: p.sellingPrice,
        valuation: cost * p.stockQuantity,
        status: p.stockQuantity <= 0 ? 'Out of Stock' : p.stockQuantity <= 5 ? 'Low Stock' : 'In Stock',
      };
    });

    if (format === 'csv') {
      let csv = 'SKU,Product Name,Category,Brand,Stock,Cost Price,Unit Price,Valuation,Status\n';
      reportData.forEach((r) => {
        csv += `"${r.sku}","${r.name.replace(/"/g, '""')}","${r.category}","${r.brand}",${r.stockQuantity},${r.costPrice},${r.sellingPrice},${r.valuation},"${r.status}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=voltedge-inventory-report.csv');
      return res.status(200).send(csv);
    }

    res.json({ success: true, data: reportData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate inventory report' });
  }
});

// GET /api/admin/reports/sales
router.get('/sales', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { range, start, end, format } = req.query;
    const dateFilter = getDateRange(range as string, start as string, end as string);

    const where: any = {};
    if (dateFilter.gte || dateFilter.lte) {
      where.createdAt = dateFilter;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    const reportData = orders.map((o) => ({
      orderNumber: o.orderNumber,
      date: o.createdAt.toISOString().split('T')[0],
      customer: o.customerName,
      itemsCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: o.subtotal,
      discount: o.discountAmount,
      tax: o.taxAmount,
      total: o.totalAmount,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
    }));

    if (format === 'csv') {
      let csv = 'Order ID,Date,Customer,Items,Subtotal,Discount,Tax,Total,Payment Method,Payment Status,Order Status\n';
      reportData.forEach((r) => {
        csv += `"${r.orderNumber}","${r.date}","${r.customer}",${r.itemsCount},${r.subtotal},${r.discount},${r.tax},${r.total},"${r.paymentMethod}","${r.paymentStatus}","${r.orderStatus}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=voltedge-sales-report.csv');
      return res.status(200).send(csv);
    }

    res.json({ success: true, data: reportData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate sales report' });
  }
});

// GET /api/admin/reports/customers
router.get('/customers', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { format } = req.query;

    const customers = await prisma.customer.findMany({
      where: { isArchived: false },
      orderBy: { totalSpent: 'desc' },
    });

    const reportData = customers.map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      email: c.email,
      phone: c.phone || 'N/A',
      totalOrders: c.totalOrders,
      totalSpent: c.totalSpent,
      avgOrderValue: c.totalOrders > 0 ? Math.round((c.totalSpent / c.totalOrders) * 100) / 100 : 0,
      status: c.status,
      registeredDate: c.createdAt.toISOString().split('T')[0],
    }));

    if (format === 'csv') {
      let csv = 'Customer Name,Email,Phone,Total Orders,Total Spent,Avg Order Value,Status,Registered Date\n';
      reportData.forEach((r) => {
        csv += `"${r.name}","${r.email}","${r.phone}",${r.totalOrders},${r.totalSpent},${r.avgOrderValue},"${r.status}","${r.registeredDate}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=voltedge-customers-report.csv');
      return res.status(200).send(csv);
    }

    res.json({ success: true, data: reportData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate customer report' });
  }
});

export default router;

