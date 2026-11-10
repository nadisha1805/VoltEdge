import { Router, Response } from 'express';
import { prisma } from '../../prisma.js';
import { verifyAdminToken, requireRole } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/auth.js';
import { upload } from '../../utils/upload.js';
import { logActivity } from '../../utils/logger.js';

const router = Router();

// GET /api/admin/products (Paginated with search, filters, and sorting)
router.get('/', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      category,
      brand,
      stockStatus,
      includeArchived = 'false',
      sort = 'newest',
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

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { sku: { contains: term } },
        { description: { contains: term } },
        { brand: { name: { contains: term } } },
        { category: { name: { contains: term } } },
      ];
    }

    if (category && typeof category === 'string' && category !== 'all') {
      where.categoryId = category;
    }

    if (brand && typeof brand === 'string' && brand !== 'all') {
      where.brandId = brand;
    }

    if (stockStatus && typeof stockStatus === 'string' && stockStatus !== 'all') {
      where.stockStatus = stockStatus;
    }

    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'name-desc':
        orderBy = { name: 'desc' };
        break;
      case 'price-asc':
        orderBy = { sellingPrice: 'asc' };
        break;
      case 'price-desc':
        orderBy = { sellingPrice: 'desc' };
        break;
      case 'stock-asc':
        orderBy = { stockQuantity: 'asc' };
        break;
      case 'stock-desc':
        orderBy = { stockQuantity: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map((prod) => {
      let parsedImages: string[] = [];
      let parsedSpecs: Record<string, string> = {};

      try {
        parsedImages = prod.images ? JSON.parse(prod.images) : [];
      } catch {
        parsedImages = [prod.primaryImage];
      }

      try {
        parsedSpecs = prod.specifications ? JSON.parse(prod.specifications) : {};
      } catch {
        parsedSpecs = {};
      }

      return {
        ...prod,
        images: parsedImages,
        specifications: parsedSpecs,
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
    console.error('Error fetching admin products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// POST /api/admin/products/upload-images
router.post(
  '/upload-images',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  upload.array('images', 8),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'No images were uploaded.' });
      }

      const imageUrls = files.map((file) => `/uploads/${file.filename}`);

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        imageUrls,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Image upload failed' });
    }
  }
);

// GET /api/admin/products/:id
router.get('/:id', verifyAdminToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        inventoryMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let parsedImages: string[] = [];
    let parsedSpecs: Record<string, string> = {};

    try {
      parsedImages = product.images ? JSON.parse(product.images) : [];
    } catch {
      parsedImages = [product.primaryImage];
    }

    try {
      parsedSpecs = product.specifications ? JSON.parse(product.specifications) : {};
    } catch {
      parsedSpecs = {};
    }

    res.json({
      success: true,
      data: {
        ...product,
        images: parsedImages,
        specifications: parsedSpecs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
});

// POST /api/admin/products
router.post(
  '/',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        name,
        slug,
        sku,
        brandId,
        categoryId,
        description,
        shortDescription,
        sellingPrice,
        costPrice = 0,
        originalPrice,
        stockQuantity = 15,
        warrantyInfo,
        images,
        primaryImage,
        tags,
        specifications,
        isFeatured = false,
        isBestSeller = false,
        isLatestArrival = false,
        isSpecialOffer = false,
      } = req.body;

      if (!name || !sku || !brandId || !categoryId || sellingPrice === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, sku, brand, category, and selling price are mandatory.',
        });
      }

      // Check unique SKU
      const existingSku = await prisma.product.findUnique({ where: { sku: sku.trim() } });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: `SKU "${sku}" is already in use by another product.`,
        });
      }

      // Generate or clean slug
      let finalSlug = slug
        ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const existingSlug = await prisma.product.findUnique({ where: { slug: finalSlug } });
      if (existingSlug) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }

      // Stock status determination
      const qty = parseInt(stockQuantity, 10) || 0;
      let stockStatus = 'IN_STOCK';
      if (qty <= 0) stockStatus = 'OUT_OF_STOCK';
      else if (qty <= 5) stockStatus = 'LOW_STOCK';

      // Parse images and specs
      let imagesJson = '[]';
      let primary = primaryImage || '';
      if (Array.isArray(images) && images.length > 0) {
        imagesJson = JSON.stringify(images);
        if (!primary) primary = images[0];
      } else if (typeof images === 'string') {
        imagesJson = images;
        if (!primary) primary = images;
      }

      const specsJson = typeof specifications === 'object' ? JSON.stringify(specifications) : specifications || '{}';

      // Atomic transaction: create product + initial inventory movement
      const product = await prisma.$transaction(async (tx) => {
        const createdProduct = await tx.product.create({
          data: {
            name: name.trim(),
            slug: finalSlug,
            sku: sku.trim().toUpperCase(),
            brandId,
            categoryId,
            description: description || '',
            shortDescription: shortDescription || null,
            sellingPrice: parseFloat(sellingPrice),
            costPrice: parseFloat(costPrice) || Math.round(parseFloat(sellingPrice) * 0.72),
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            discountPercentage:
              originalPrice && parseFloat(originalPrice) > parseFloat(sellingPrice)
                ? Math.round(((parseFloat(originalPrice) - parseFloat(sellingPrice)) / parseFloat(originalPrice)) * 100)
                : null,
            stockQuantity: qty,
            stockStatus,
            warrantyInfo: warrantyInfo || '1 Year Official Brand Warranty',
            images: imagesJson,
            primaryImage: primary || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
            tags: tags || null,
            specifications: specsJson,
            isFeatured: Boolean(isFeatured),
            isBestSeller: Boolean(isBestSeller),
            isLatestArrival: Boolean(isLatestArrival),
            isSpecialOffer: Boolean(isSpecialOffer),
          },
          include: { brand: true, category: true },
        });

        // Record initial inventory movement
        await tx.inventoryMovement.create({
          data: {
            productId: createdProduct.id,
            previousQuantity: 0,
            quantityChanged: qty,
            newQuantity: qty,
            movementType: 'STOCK_IN',
            reason: 'Initial stock intake upon product creation',
            adminUserId: req.admin?.id,
            updatedBy: req.admin?.fullName || 'Staff',
          },
        });

        return createdProduct;
      });

      await logActivity(
        req.admin,
        'CREATE',
        'PRODUCTS',
        `Product created: "${product.name}" (SKU: ${product.sku}) with ${qty} units`,
        { productId: product.id, sku: product.sku },
        req
      );

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error: any) {
      console.error('Error creating product:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to create product' });
    }
  }
);

// PUT /api/admin/products/:id
router.put(
  '/:id',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const {
        name,
        slug,
        sku,
        brandId,
        categoryId,
        description,
        shortDescription,
        sellingPrice,
        costPrice,
        originalPrice,
        stockQuantity,
        warrantyInfo,
        images,
        primaryImage,
        tags,
        specifications,
        isFeatured,
        isBestSeller,
        isLatestArrival,
        isSpecialOffer,
        isArchived,
      } = req.body;

      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // If SKU changed, ensure uniqueness
      if (sku && sku.trim().toUpperCase() !== existing.sku) {
        const skuCheck = await prisma.product.findUnique({ where: { sku: sku.trim().toUpperCase() } });
        if (skuCheck) {
          return res.status(400).json({ success: false, message: `SKU "${sku}" is already in use.` });
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (slug !== undefined) updateData.slug = slug.trim().toLowerCase();
      if (sku !== undefined) updateData.sku = sku.trim().toUpperCase();
      if (brandId !== undefined) updateData.brandId = brandId;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (description !== undefined) updateData.description = description;
      if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
      if (sellingPrice !== undefined) updateData.sellingPrice = parseFloat(sellingPrice);
      if (costPrice !== undefined) updateData.costPrice = parseFloat(costPrice);
      if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
      if (warrantyInfo !== undefined) updateData.warrantyInfo = warrantyInfo;
      if (tags !== undefined) updateData.tags = tags;
      if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
      if (isBestSeller !== undefined) updateData.isBestSeller = Boolean(isBestSeller);
      if (isLatestArrival !== undefined) updateData.isLatestArrival = Boolean(isLatestArrival);
      if (isSpecialOffer !== undefined) updateData.isSpecialOffer = Boolean(isSpecialOffer);
      if (isArchived !== undefined) updateData.isArchived = Boolean(isArchived);

      if (images !== undefined) {
        updateData.images = Array.isArray(images) ? JSON.stringify(images) : images;
      }
      if (primaryImage !== undefined) {
        updateData.primaryImage = primaryImage;
      }
      if (specifications !== undefined) {
        updateData.specifications = typeof specifications === 'object' ? JSON.stringify(specifications) : specifications;
      }

      // Re-calculate discount percentage if prices provided
      const currentSell = updateData.sellingPrice ?? existing.sellingPrice;
      const currentOrig = updateData.originalPrice ?? existing.originalPrice;
      if (currentOrig && currentOrig > currentSell) {
        updateData.discountPercentage = Math.round(((currentOrig - currentSell) / currentOrig) * 100);
      }

      // Stock adjustment tracking
      const newStock = stockQuantity !== undefined ? parseInt(stockQuantity, 10) : existing.stockQuantity;
      if (stockQuantity !== undefined && newStock !== existing.stockQuantity) {
        updateData.stockQuantity = newStock;
        if (newStock <= 0) updateData.stockStatus = 'OUT_OF_STOCK';
        else if (newStock <= 5) updateData.stockStatus = 'LOW_STOCK';
        else updateData.stockStatus = 'IN_STOCK';
      }

      const updated = await prisma.$transaction(async (tx) => {
        const prod = await tx.product.update({
          where: { id },
          data: updateData,
          include: { brand: true, category: true },
        });

        if (stockQuantity !== undefined && newStock !== existing.stockQuantity) {
          const diff = newStock - existing.stockQuantity;
          await tx.inventoryMovement.create({
            data: {
              productId: id,
              previousQuantity: existing.stockQuantity,
              quantityChanged: diff,
              newQuantity: newStock,
              movementType: diff > 0 ? 'STOCK_IN' : 'STOCK_OUT',
              reason: 'Product update via admin catalog editor',
              adminUserId: req.admin?.id,
              updatedBy: req.admin?.fullName || 'Staff',
            },
          });
        }

        return prod;
      });

      await logActivity(
        req.admin,
        'UPDATE',
        'PRODUCTS',
        `Product updated: "${updated.name}" (SKU: ${updated.sku})`,
        { productId: updated.id },
        req
      );

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updated,
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to update product' });
    }
  }
);

// DELETE /api/admin/products/:id (Safe Deletion & Archival)
router.delete(
  '/:id',
  verifyAdminToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          _count: { select: { orderItems: true } },
        },
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // If product is associated with order history, soft archive it to protect audit trails
      if (product._count.orderItems > 0) {
        await prisma.product.update({
          where: { id },
          data: { isArchived: true, stockStatus: 'OUT_OF_STOCK' },
        });

        await logActivity(
          req.admin,
          'ARCHIVE',
          'PRODUCTS',
          `Product archived due to existing order history: "${product.name}"`,
          { productId: product.id },
          req
        );

        return res.json({
          success: true,
          message: 'Product has historical orders and was safely archived rather than deleted.',
          archived: true,
        });
      }

      // Safe to hard delete if no orders depend on it
      await prisma.product.delete({ where: { id } });

      await logActivity(
        req.admin,
        'DELETE',
        'PRODUCTS',
        `Product permanently deleted: "${product.name}" (SKU: ${product.sku})`,
        { productId: product.id },
        req
      );

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
  }
);

export default router;

