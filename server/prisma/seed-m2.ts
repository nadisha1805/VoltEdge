import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⚡ Starting Milestone 2 Showroom Data Seeding...');

  // 1. Showroom Settings
  const existingSettings = await prisma.showroomSettings.findUnique({ where: { id: 'default' } });
  if (!existingSettings) {
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
    console.log('✅ Showroom default settings created.');
  }

  // 2. Admin Users & Staff
  const adminUsers = [
    {
      email: 'admin@voltedge.com',
      password: 'AdminPassword@123',
      fullName: 'Vikram Malhotra',
      phone: '+91 98765 00001',
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      email: 'manager@voltedge.com',
      password: 'ManagerPassword@123',
      fullName: 'Priya Sharma',
      phone: '+91 98765 00002',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    },
    {
      email: 'inventory@voltedge.com',
      password: 'InventoryPassword@123',
      fullName: 'Rahul Verma',
      phone: '+91 98765 00003',
      role: 'INVENTORY_MANAGER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    {
      email: 'sales@voltedge.com',
      password: 'SalesPassword@123',
      fullName: 'Ananya Patel',
      phone: '+91 98765 00004',
      role: 'SALES_STAFF',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
  ];

  let superAdminId = '';

  for (const user of adminUsers) {
    const existing = await prisma.adminUser.findUnique({ where: { email: user.email } });
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(user.password, salt);

    if (!existing) {
      const created = await prisma.adminUser.create({
        data: {
          email: user.email,
          passwordHash,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
      });
      if (user.role === 'SUPER_ADMIN') superAdminId = created.id;
      console.log(`✅ Seeded staff account: ${user.fullName} (${user.role})`);
    } else {
      if (user.role === 'SUPER_ADMIN') superAdminId = existing.id;
    }
  }

  // 3. Update Existing Products with Cost Price for Inventory Valuation
  // Cost price estimated at 75% of selling price
  const products = await prisma.product.findMany();
  for (const p of products) {
    if (p.costPrice === 0) {
      const costPrice = Math.round(p.sellingPrice * 0.72);
      await prisma.product.update({
        where: { id: p.id },
        data: {
          costPrice,
          warrantyInfo: p.warrantyInfo || '1 Year Official Brand Warranty',
        },
      });
    }
  }
  console.log(`✅ Updated cost prices on ${products.length} catalog products for accurate inventory valuation.`);

  // 4. Seed Inventory Movements for initial stock
  const existingMovements = await prisma.inventoryMovement.count();
  if (existingMovements === 0) {
    for (const p of products.slice(0, 10)) {
      await prisma.inventoryMovement.create({
        data: {
          productId: p.id,
          previousQuantity: 0,
          quantityChanged: p.stockQuantity,
          newQuantity: p.stockQuantity,
          movementType: 'STOCK_IN',
          reason: 'Initial showroom inventory receipt',
          referenceNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          adminUserId: superAdminId || undefined,
          updatedBy: 'Vikram Malhotra',
        },
      });
    }
    console.log('✅ Initial stock movements logged.');
  }

  // 5. Seed Customers & Addresses
  const customersData = [
    {
      firstName: 'Arjun',
      lastName: 'Mehta',
      email: 'arjun.mehta@gmail.com',
      phone: '+91 98111 22334',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      totalOrders: 2,
      totalSpent: 284990.0,
      notes: 'VIP Customer. Prefers premium Apple & Sony gear.',
      address: {
        addressLine1: '402, Skyline Residency, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560038',
      },
    },
    {
      firstName: 'Sneha',
      lastName: 'Rao',
      email: 'sneha.rao@outlook.com',
      phone: '+91 98222 33445',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      totalOrders: 1,
      totalSpent: 129990.0,
      notes: 'Requested express showroom pickup for previous orders.',
      address: {
        addressLine1: 'B-14, Greenview Apartments, Koramangala 4th Block',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560034',
      },
    },
    {
      firstName: 'Karan',
      lastName: 'Deshmukh',
      email: 'karan.deshmukh@gmail.com',
      phone: '+91 98333 44556',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      totalOrders: 1,
      totalSpent: 39990.0,
      notes: 'Audio professional interested in audiophile DACs and studio monitors.',
      address: {
        addressLine1: '78, 12th Main, HSR Layout Sector 3',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560102',
      },
    },
  ];

  const createdCustomers: any[] = [];
  for (const c of customersData) {
    let customer = await prisma.customer.findUnique({ where: { email: c.email } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone,
          avatar: c.avatar,
          totalOrders: c.totalOrders,
          totalSpent: c.totalSpent,
          notes: c.notes,
          addresses: {
            create: {
              addressType: 'SHIPPING',
              addressLine1: c.address.addressLine1,
              city: c.address.city,
              state: c.address.state,
              postalCode: c.address.postalCode,
              country: 'India',
              isDefault: true,
            },
          },
        },
      });
      console.log(`✅ Seeded customer: ${c.firstName} ${c.lastName}`);
    }
    createdCustomers.push(customer);
  }

  // 6. Seed Sample Orders with Items and Status History
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0 && products.length >= 2 && createdCustomers.length >= 2) {
    // Order 1: Delivered
    const prod1 = products[0];
    const cust1 = createdCustomers[0];
    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'VOLT-2026-1001',
        customerId: cust1.id,
        customerName: `${cust1.firstName} ${cust1.lastName}`,
        customerEmail: cust1.email,
        customerPhone: cust1.phone,
        shippingAddress: '402, Skyline Residency, Indiranagar, Bangalore - 560038',
        billingAddress: '402, Skyline Residency, Indiranagar, Bangalore - 560038',
        subtotal: prod1.sellingPrice,
        discountAmount: 2000.0,
        taxAmount: Math.round(prod1.sellingPrice * 0.18),
        shippingFee: 0.0,
        totalAmount: prod1.sellingPrice - 2000.0,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        paymentReference: 'UPI-REF-90218820',
        orderStatus: 'DELIVERED',
        couponCode: 'WELCOME10',
        items: {
          create: {
            productId: prod1.id,
            productName: prod1.name,
            productSku: prod1.sku,
            productImageUrl: prod1.primaryImage,
            unitPrice: prod1.sellingPrice,
            quantity: 1,
            totalPrice: prod1.sellingPrice,
          },
        },
        statusHistory: {
          createMany: {
            data: [
              { status: 'PENDING', comment: 'Order placed by customer via showroom terminal', updatedBy: 'System' },
              { status: 'CONFIRMED', comment: 'Payment verified via UPI gateway', updatedBy: 'Vikram Malhotra' },
              { status: 'PROCESSING', comment: 'Item packed in anti-static protective box', updatedBy: 'Rahul Verma' },
              { status: 'SHIPPED', comment: 'Handed over to BlueDart Express (AWB: BLUEDART-8829)', updatedBy: 'Rahul Verma' },
              { status: 'DELIVERED', comment: 'Successfully delivered and signed by customer', updatedBy: 'BlueDart Courier' },
            ],
          },
        },
      },
    });

    // Order 2: Processing
    const prod2 = products[1] || products[0];
    const cust2 = createdCustomers[1];
    await prisma.order.create({
      data: {
        orderNumber: 'VOLT-2026-1002',
        customerId: cust2.id,
        customerName: `${cust2.firstName} ${cust2.lastName}`,
        customerEmail: cust2.email,
        customerPhone: cust2.phone,
        shippingAddress: 'B-14, Greenview Apartments, Koramangala 4th Block, Bangalore - 560034',
        subtotal: prod2.sellingPrice,
        discountAmount: 0.0,
        taxAmount: Math.round(prod2.sellingPrice * 0.18),
        shippingFee: 0.0,
        totalAmount: prod2.sellingPrice,
        paymentStatus: 'PAID',
        paymentMethod: 'CREDIT_CARD',
        paymentReference: 'TXN-HDFC-992124',
        orderStatus: 'PROCESSING',
        items: {
          create: {
            productId: prod2.id,
            productName: prod2.name,
            productSku: prod2.sku,
            productImageUrl: prod2.primaryImage,
            unitPrice: prod2.sellingPrice,
            quantity: 1,
            totalPrice: prod2.sellingPrice,
          },
        },
        statusHistory: {
          createMany: {
            data: [
              { status: 'PENDING', comment: 'Order placed online', updatedBy: 'System' },
              { status: 'CONFIRMED', comment: 'Card payment authorized', updatedBy: 'System' },
              { status: 'PROCESSING', comment: 'Allocated from main warehouse shelf A-12', updatedBy: 'Rahul Verma' },
            ],
          },
        },
      },
    });

    console.log('✅ Seeded baseline Orders and OrderStatusHistory.');
  }

  // 7. Seed Coupons
  const couponsData = [
    {
      code: 'WELCOME10',
      description: '10% welcome discount on first order over ₹10,000',
      discountType: 'PERCENTAGE',
      discountValue: 10.0,
      minOrderAmount: 10000.0,
      maxDiscount: 2000.0,
      usageLimit: 500,
      usageCount: 12,
      isActive: true,
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2026-12-31'),
    },
    {
      code: 'TECHFEST20',
      description: 'Exclusive 20% festive discount on flagship audio & wearables',
      discountType: 'PERCENTAGE',
      discountValue: 20.0,
      minOrderAmount: 25000.0,
      maxDiscount: 5000.0,
      usageLimit: 100,
      usageCount: 28,
      isActive: true,
      startDate: new Date('2026-02-01'),
      expiryDate: new Date('2026-04-30'),
    },
    {
      code: 'VOLT500',
      description: 'Flat ₹500 discount on orders above ₹5,000',
      discountType: 'FIXED',
      discountValue: 500.0,
      minOrderAmount: 5000.0,
      maxDiscount: 500.0,
      usageLimit: 200,
      usageCount: 45,
      isActive: true,
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2026-06-30'),
    },
  ];

  for (const coup of couponsData) {
    const existing = await prisma.coupon.findUnique({ where: { code: coup.code } });
    if (!existing) {
      await prisma.coupon.create({ data: coup });
      console.log(`✅ Seeded coupon: ${coup.code}`);
    }
  }

  // 8. Seed Contact Enquiries
  const enquiriesData = [
    {
      name: 'Rohan Mehra',
      email: 'rohan.mehra@techcorp.in',
      phone: '+91 99887 76655',
      subject: 'Bulk Procurement for Developer Workstations',
      message: 'Hello VOLTEDGE Team, We are looking to procure 15 units of MacBook Pro M3 Max and 20 Dell UltraSharp 32" monitors for our engineering hub in Whitefield. Could you please share commercial B2B quotation and delivery timelines?',
      status: 'NEW',
    },
    {
      name: 'Dr. Kavita Joshi',
      email: 'kavita.joshi@neurocare.org',
      phone: '+91 98777 66554',
      subject: 'Warranty Extension on Sony WH-1000XM5',
      message: 'I purchased the Sony WH-1000XM5 headphones last week at your Cyber City showroom. Wanted to confirm if I can add the 2-year accidental damage protection plan post-purchase?',
      status: 'IN_PROGRESS',
      adminNotes: 'Assigned to Priya Sharma. Customer contacted via phone, sent warranty brochure.',
    },
    {
      name: 'Aditya Sen',
      email: 'aditya.sen@studio4.com',
      phone: '+91 97665 44332',
      subject: 'Audio Interface & Studio Gear Demo',
      message: 'Can I schedule an appointment this Saturday afternoon for an in-showroom listening session of the Sennheiser HD 800S and Focal Bathys?',
      status: 'RESOLVED',
      adminNotes: 'Showroom demo booked for Saturday 3:30 PM with in-house audio specialist.',
      respondedAt: new Date(),
    },
  ];

  const existingEnquiries = await prisma.contactEnquiry.count();
  if (existingEnquiries === 0) {
    for (const enq of enquiriesData) {
      await prisma.contactEnquiry.create({ data: enq });
    }
    console.log('✅ Seeded contact enquiries.');
  }

  // 9. Seed Initial Activity Logs
  const existingLogs = await prisma.activityLog.count();
  if (existingLogs === 0) {
    await prisma.activityLog.createMany({
      data: [
        {
          adminUserId: superAdminId || undefined,
          adminName: 'Vikram Malhotra',
          action: 'LOGIN',
          module: 'AUTH',
          description: 'Super Admin Vikram Malhotra logged in to Showroom Management Console',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        {
          adminUserId: superAdminId || undefined,
          adminName: 'Vikram Malhotra',
          action: 'ADJUST_STOCK',
          module: 'INVENTORY',
          description: 'Initial stock intake verified across 16 showroom product lines',
          ipAddress: '127.0.0.1',
        },
      ],
    });
    console.log('✅ Seeded initial activity logs.');
  }

  console.log('🎉 Milestone 2 database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during M2 seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

