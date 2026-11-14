import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('⚡ Starting Production Cloud Database Sync...');

  // Auto-init settings if missing
  const defaultSettings = await prisma.showroomSettings.findUnique({ where: { id: 'default' } });
  if (!defaultSettings) {
    await prisma.showroomSettings.create({
      data: {
        id: 'default',
        storeName: 'VOLTEDGE Electronics',
        tagline: 'Powering Your Digital World.',
        email: 'support@voltedge-electronics.com',
        phone: '+91 98765 43210',
        address: 'Plot 42, Digital Corridor, Cyber City, Bangalore - 560100',
        businessHours: 'Mon - Sat: 9:30 AM - 9:00 PM | Sun: 10:00 AM - 7:00 PM',
        currency: 'INR',
        currencySymbol: '₹',
        lowStockThreshold: 5,
        taxRate: 18.0,
      },
    });
    console.log('✅ Showroom default settings ensured.');
  }

  // Check if products exist; if not, import from snapshot
  const productCount = await prisma.product.count();
  const seedFile = path.resolve(process.cwd(), 'production-seed-data.json');

  if (productCount === 0 && fs.existsSync(seedFile)) {
    console.log('📦 Database empty. Importing snapshot into cloud database...');
    const rawData = fs.readFileSync(seedFile, 'utf-8');
    const data = JSON.parse(rawData);

    // 1. Brands
    for (const b of data.brands || []) {
      await prisma.brand.upsert({
        where: { id: b.id },
        update: {},
        create: {
          id: b.id,
          name: b.name,
          slug: b.slug,
          logoUrl: b.logoUrl,
          description: b.description,
          featured: b.featured ?? false,
        },
      });
    }

    // 2. Categories
    for (const c of data.categories || []) {
      await prisma.category.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          icon: c.icon,
          imageUrl: c.imageUrl,
          featured: c.featured ?? false,
          displayOrder: c.displayOrder ?? 0,
        },
      });
    }

    // 3. Products
    for (const p of data.products || []) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          brandId: p.brandId,
          categoryId: p.categoryId,
          description: p.description,
          shortDescription: p.shortDescription,
          sellingPrice: p.sellingPrice,
          costPrice: p.costPrice ?? 0,
          originalPrice: p.originalPrice,
          discountPercentage: p.discountPercentage,
          rating: p.rating ?? 0,
          reviewCount: p.reviewCount ?? 0,
          stockStatus: p.stockStatus ?? 'IN_STOCK',
          stockQuantity: p.stockQuantity ?? 15,
          warrantyInfo: p.warrantyInfo,
          images: p.images,
          primaryImage: p.primaryImage,
          tags: p.tags,
          specifications: p.specifications,
          isFeatured: p.isFeatured ?? false,
          isBestSeller: p.isBestSeller ?? false,
          isLatestArrival: p.isLatestArrival ?? false,
          isSpecialOffer: p.isSpecialOffer ?? false,
        },
      });
    }

    // 4. Admin Users
    for (const u of data.adminUsers || []) {
      await prisma.adminUser.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          email: u.email,
          passwordHash: u.passwordHash,
          fullName: u.fullName,
          phone: u.phone,
          role: u.role,
          avatar: u.avatar,
          isActive: u.isActive ?? true,
        },
      });
    }

    // 5. Coupons
    for (const c of data.coupons || []) {
      await prisma.coupon.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          code: c.code,
          description: c.description,
          discountType: c.discountType,
          discountValue: c.discountValue,
          minOrderAmount: c.minOrderAmount ?? 0,
          maxDiscount: c.maxDiscount,
          usageLimit: c.usageLimit,
          perCustomerLimit: c.perCustomerLimit ?? 1,
          usageCount: c.usageCount ?? 0,
          isActive: c.isActive ?? true,
        },
      });
    }

    console.log(`✅ Production cloud sync complete! Seeded ${data.products.length} products and admin users.`);
  } else {
    console.log(`ℹ️ Cloud database already has ${productCount} products.`);
  }
}

main()
  .catch((e) => {
    console.error('Production sync error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

