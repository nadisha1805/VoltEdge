import { Router, Response } from 'express';
import { prisma } from '../../prisma.js';
import { verifyAdminToken, requireRole } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

// GET /api/admin/inventory/overview
router.get('/overview', verifyAdminToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await prisma.showroomSettings.findUnique({ where: { id: 'default' } });
    const lowStockThreshold = settings?.lowStockThreshold ?? 5;

    const products = await prisma.product.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        stockQuantity: true,
        costPrice: true,
        sellingPrice: true,
      },
    });

    let totalStockUnits = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inventoryCostValuation = 0; // Standard Cost Valuation: Sum(costPrice * stockQuantity)
    let inventoryRetailValuation = 0; // Retail Valuation: Sum(sellingPrice * stockQuantity)

    for (const p of products) {
      totalStockUnits += p.stockQuantity;
      const cost = p.costPrice > 0 ? p.costPrice : Math.round(p.sellingPrice * 0.72);
      inventoryCostValuation += cost * p.stockQuantity;
      inventoryRetailValuation += p.sellingPrice * p.stockQuantity;

      if (p.stockQuantity <= 0) {
        outOfStockCount++;
      } else if (p.stockQuantity <= lowStockThreshold) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    }

    res.json({
      success: true,
      data: {
        totalStockUnits,
        inStockProducts: inStockCount,
        lowStockProducts: lowStockCount,
        outOfStockProducts: outOfStockCount,
        valuationMethod: 'Standard Cost Basis [Sum(Unit Cost Price * On-Hand Quantity)]',
        inventoryCostValuation: Math.round(inventoryCostValuation * 100) / 100,
        inventoryRetailValuation: Math.round(inventoryRetailValuation * 100) / 100,
        lowStockThreshold,
      },
    });
  } catch (error) {
    console.error('Error fetching inventory overview:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory overview' });
  }
});

// GET /api/admin/inventory
router.get('/', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      stockStatus,
      category,
      brand,
      page = '1',
      limit = '10',
    } = req.query;

    const settings = await prisma.showroomSettings.findUnique({ where: { id: 'default' } });
    const lowStockThreshold = settings?.lowStockThreshold ?? 5;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isArchived: false };

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { sku: { contains: term } },
      ];
    }

    if (category && typeof category === 'string' && category !== 'all') {
      where.categoryId = category;
    }

    if (brand && typeof brand === 'string' && brand !== 'all') {
      where.brandId = brand;
    }

    if (stockStatus && stockStatus !== 'all') {
      if (stockStatus === 'OUT_OF_STOCK') {
        where.stockQuantity = { lte: 0 };
      } else if (stockStatus === 'LOW_STOCK') {
        where.stockQuantity = { gt: 0, lte: lowStockThreshold };
      } else if (stockStatus === 'IN_STOCK') {
        where.stockQuantity = { gt: lowStockThreshold };
      }
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          sku: true,
          primaryImage: true,
          stockQuantity: true,
          stockStatus: true,
          costPrice: true,
          sellingPrice: true,
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          updatedAt: true,
        },
        orderBy: { stockQuantity: 'asc' },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map((p) => {
      const cost = p.costPrice > 0 ? p.costPrice : Math.round(p.sellingPrice * 0.72);
      const costValuation = cost * p.stockQuantity;
      return {
        ...p,
        costPrice: cost,
        inventoryValuation: costValuation,
        isLowStock: p.stockQuantity > 0 && p.stockQuantity <= lowStockThreshold,
        isOutOfStock: p.stockQuantity <= 0,
      };
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: formattedProducts,
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
    res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
});

// POST /api/admin/inventory/adjust (Atomic Transaction with InventoryMovement creation)
router.post(
  '/adjust',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        productId,
        quantityChanged,
        movementType, // "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "RETURN_RESTOCK" | "CORRECTION"
        reason,
        referenceNumber,
      } = req.body;

      if (!productId || quantityChanged === undefined || !movementType || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Product ID, quantity change, movement type, and reason are required.',
        });
      }

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      const change = parseInt(quantityChanged, 10);
      if (isNaN(change) || change === 0) {
        return res.status(400).json({ success: false, message: 'Quantity change must be a non-zero integer.' });
      }

      const previousQuantity = product.stockQuantity;
      const newQuantity = previousQuantity + change;

      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce stock below zero. Current stock: ${previousQuantity}, requested reduction: ${Math.abs(change)}.`,
        });
      }

      // Determine updated stock status
      let stockStatus = 'IN_STOCK';
      if (newQuantity <= 0) stockStatus = 'OUT_OF_STOCK';
      else if (newQuantity <= 5) stockStatus = 'LOW_STOCK';

      // Atomic execution
      const result = await prisma.$transaction(async (tx) => {
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: {
            stockQuantity: newQuantity,
            stockStatus,
          },
        });

        const movement = await tx.inventoryMovement.create({
          data: {
            productId,
            previousQuantity,
            quantityChanged: change,
            newQuantity,
            movementType,
            reason: reason.trim(),
            referenceNumber: referenceNumber ? referenceNumber.trim() : null,
            adminUserId: req.admin?.id,
            updatedBy: req.admin?.fullName || 'Staff Member',
          },
        });

        return { product: updatedProduct, movement };
      });

      await logActivity(
        req.admin,
        'ADJUST_STOCK',
        'INVENTORY',
        `Adjusted stock for ${product.name} (${product.sku}): ${previousQuantity} -> ${newQuantity} (${change > 0 ? '+' : ''}${change}) [${movementType}]`,
        { productId, previousQuantity, newQuantity, change, reason },
        req
      );

      res.json({
        success: true,
        message: 'Stock updated and movement recorded successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to adjust stock' });
    }
  }
);

// GET /api/admin/inventory/movements (Movement Ledger)
router.get('/movements', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      productId,
      movementType,
      search,
      page = '1',
      limit = '15',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (productId && typeof productId === 'string' && productId !== 'all') {
      where.productId = productId;
    }

    if (movementType && typeof movementType === 'string' && movementType !== 'all') {
      where.movementType = movementType;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { product: { name: { contains: term } } },
        { product: { sku: { contains: term } } },
        { reason: { contains: term } },
        { referenceNumber: { contains: term } },
        { updatedBy: { contains: term } },
      ];
    }

    const [movements, totalCount] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              primaryImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: movements,
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
    res.status(500).json({ success: false, message: 'Failed to fetch inventory movements' });
  }
});

export default router;

