import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET all products with filtering, search, sorting & pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      featured,
      bestSeller,
      latestArrival,
      specialOffer,
      sort = 'featured',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Search filter across name, description, tags, and brand name
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { tags: { contains: searchTerm } },
        { brand: { name: { contains: searchTerm } } },
      ];
    }

    // Category filter (slug or id)
    if (category && typeof category === 'string' && category !== 'all') {
      where.OR = [
        ...(where.OR || []),
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    // Brand filter (slug or id)
    if (brand && typeof brand === 'string' && brand !== 'all') {
      const brandList = brand.split(',').map((b) => b.trim());
      where.brand = {
        OR: [
          { slug: { in: brandList } },
          { id: { in: brandList } },
        ],
      };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice as string);
    }

    // In-Stock filter
    if (inStock === 'true') {
      where.stockStatus = { in: ['IN_STOCK', 'LOW_STOCK'] };
    }

    // Boolean flags
    if (featured === 'true') where.isFeatured = true;
    if (bestSeller === 'true') where.isBestSeller = true;
    if (latestArrival === 'true') where.isLatestArrival = true;
    if (specialOffer === 'true') where.isSpecialOffer = true;

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'price-asc':
        orderBy = { sellingPrice: 'asc' };
        break;
      case 'price-desc':
        orderBy = { sellingPrice: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'name-desc':
        orderBy = { name: 'desc' };
        break;
      case 'discount':
        orderBy = { discountPercentage: 'desc' };
        break;
      case 'featured':
      default:
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    // Parse images and specifications from JSON strings
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
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// GET single product by slug or id
router.get('/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        category: true,
        brand: true,
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

    // Fetch related products from same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      include: { category: true, brand: true },
    });

    res.json({
      success: true,
      data: {
        ...product,
        images: parsedImages,
        specifications: parsedSpecs,
        relatedProducts: relatedProducts.map((p) => ({
          ...p,
          images: (() => {
            try {
              return JSON.parse(p.images);
            } catch {
              return [p.primaryImage];
            }
          })(),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

export default router;
