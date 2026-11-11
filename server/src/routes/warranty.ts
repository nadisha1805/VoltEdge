import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

// Customer: Submit warranty claim
export async function submitWarrantyClaim(req: Request, res: Response) {
  try {
    const customer = (req as any).customer;
    const {
      orderId,
      productId,
      customerName,
      customerEmail,
      customerPhone,
      serialNumber,
      purchaseDate,
      issueCategory,
      issueDescription,
      supportingDocs,
    } = req.body;

    if (!orderId || !productId || !issueCategory || !issueDescription) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Product ID, Issue Category, and Issue Description are required.',
      });
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // If customer is logged in, ensure order belongs to customer
    if (customer && order.customerId && order.customerId !== customer.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this order.' });
    }

    // Verify product belongs to order
    const orderItem = order.items.find((item) => item.productId === productId);
    if (!orderItem) {
      return res.status(400).json({
        success: false,
        message: 'The specified product was not purchased in this order.',
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    // Generate unique Claim Number: CLM-YYYY-RANDOM
    const claimNumber = `CLM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const claim = await prisma.warrantyClaim.create({
      data: {
        claimNumber,
        orderId,
        productId,
        customerId: customer?.id || order.customerId,
        customerName: customerName || order.customerName,
        customerEmail: customerEmail || order.customerEmail,
        customerPhone: customerPhone || order.customerPhone,
        serialNumber: serialNumber || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : order.createdAt,
        issueCategory,
        issueDescription,
        coverageDetails: product?.warrantyInfo || 'Standard Manufacturer Warranty',
        status: 'Submitted',
        supportingDocs: supportingDocs && Array.isArray(supportingDocs) ? {
          create: supportingDocs.map((doc: any) => ({
            fileName: doc.fileName || 'Attachment',
            fileUrl: doc.fileUrl,
            fileType: doc.fileType || 'image/jpeg',
          })),
        } : undefined,
      },
      include: {
        product: true,
        supportingDocs: true,
      },
    });

    // Create In-App Notification for Admin and Customer
    if (customer?.id) {
      await prisma.notification.create({
        data: {
          customerId: customer.id,
          title: 'Warranty Claim Submitted',
          message: `Your warranty claim ${claimNumber} for ${product?.name} has been submitted successfully.`,
          type: 'WARRANTY_UPDATE',
          link: '/account?tab=warranty',
        },
      });
    }

    // Admin Notification
    await prisma.notification.create({
      data: {
        title: 'New Warranty Claim',
        message: `Claim ${claimNumber} received for ${product?.name} from ${claim.customerName}.`,
        type: 'WARRANTY_UPDATE',
        link: '/admin/warranty',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Warranty claim submitted successfully.',
      claim,
    });
  } catch (error: any) {
    console.error('Submit warranty claim error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit warranty claim.' });
  }
}

// Customer: Get my warranty claims
export async function getCustomerWarrantyClaims(req: Request, res: Response) {
  try {
    const customer = (req as any).customer;
    if (!customer?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const claims = await prisma.warrantyClaim.findMany({
      where: { customerId: customer.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            primaryImage: true,
            warrantyInfo: true,
            sku: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            createdAt: true,
          },
        },
        supportingDocs: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, claims });
  } catch (error: any) {
    console.error('Get customer warranty claims error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch warranty claims.' });
  }
}

// Admin: Get all warranty claims with filters
export async function getAdminWarrantyClaims(req: Request, res: Response) {
  try {
    const { status, search, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const take = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = String(status);
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { claimNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerEmail: { contains: q } },
        { serialNumber: { contains: q } },
        { product: { name: { contains: q } } },
      ];
    }

    const [claims, total] = await Promise.all([
      prisma.warrantyClaim.findMany({
        where,
        include: {
          product: true,
          order: true,
          supportingDocs: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.warrantyClaim.count({ where }),
    ]);

    return res.json({
      success: true,
      claims,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    console.error('Get admin warranty claims error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch warranty claims.' });
  }
}

// Admin: Update warranty claim status
export async function updateAdminWarrantyClaim(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, rejectionReason, adminNotes } = req.body;

    const existing = await prisma.warrantyClaim.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Warranty claim not found.' });
    }

    const updated = await prisma.warrantyClaim.update({
      where: { id },
      data: {
        status: status || existing.status,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : existing.rejectionReason,
        adminNotes: adminNotes !== undefined ? adminNotes : existing.adminNotes,
      },
      include: { product: true, supportingDocs: true },
    });

    // Notify customer
    if (existing.customerId) {
      await prisma.notification.create({
        data: {
          customerId: existing.customerId,
          title: `Warranty Claim Updated: ${updated.status}`,
          message: `Your warranty claim ${existing.claimNumber} is now '${updated.status}'. ${adminNotes ? 'Note: ' + adminNotes : ''}`,
          type: 'WARRANTY_UPDATE',
          link: '/account?tab=warranty',
        },
      });
    }

    return res.json({
      success: true,
      message: `Warranty claim updated to ${updated.status}.`,
      claim: updated,
    });
  } catch (error: any) {
    console.error('Update warranty claim error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update warranty claim.' });
  }
}

