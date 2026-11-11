import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

// Customer: Submit a service request
export async function submitServiceRequest(req: Request, res: Response) {
  try {
    const customer = (req as any).customer;
    const {
      customerName,
      customerPhone,
      customerEmail,
      productCategory,
      productName,
      productModel,
      serialNumber,
      productId,
      purchaseDate,
      warrantyStatus,
      serviceType,
      preferredDate,
      serviceAddress,
      problemDescription,
      supportingImages,
    } = req.body;

    if (!customerName || !customerPhone || !customerEmail || !productCategory || !productName || !problemDescription) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, email, category, product name, and problem description are required.',
      });
    }

    const requestNumber = `SRV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const serviceReq = await prisma.serviceRequest.create({
      data: {
        requestNumber,
        customerId: customer?.id || null,
        customerName,
        customerPhone,
        customerEmail,
        productCategory,
        productName,
        productModel: productModel || null,
        serialNumber: serialNumber || null,
        productId: productId || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        warrantyStatus: warrantyStatus || 'OUT_OF_WARRANTY',
        serviceType: serviceType || 'IN_STORE',
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        serviceAddress: serviceAddress || null,
        problemDescription,
        supportingImages: supportingImages ? JSON.stringify(supportingImages) : null,
        status: 'Requested',
      },
    });

    if (customer?.id) {
      await prisma.notification.create({
        data: {
          customerId: customer.id,
          title: 'Service Request Created',
          message: `Your service request ${requestNumber} for ${productName} has been booked.`,
          type: 'SERVICE_UPDATE',
          link: '/account?tab=service',
        },
      });
    }

    await prisma.notification.create({
      data: {
        title: 'New Service Request',
        message: `Service ticket ${requestNumber} booked for ${productName} by ${customerName}.`,
        type: 'SERVICE_UPDATE',
        link: '/admin/service',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Service request created successfully.',
      serviceRequest: serviceReq,
    });
  } catch (error: any) {
    console.error('Submit service request error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit service request.' });
  }
}

// Customer: Get my service requests
export async function getCustomerServiceRequests(req: Request, res: Response) {
  try {
    const customer = (req as any).customer;
    if (!customer?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const requests = await prisma.serviceRequest.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, requests });
  } catch (error: any) {
    console.error('Get customer service requests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch service requests.' });
  }
}

// Admin: Get all service requests with filters
export async function getAdminServiceRequests(req: Request, res: Response) {
  try {
    const { status, search, category, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const take = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = String(status);
    }
    if (category && category !== 'ALL') {
      where.productCategory = String(category);
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { requestNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
        { customerEmail: { contains: q } },
        { productName: { contains: q } },
        { productModel: { contains: q } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    return res.json({
      success: true,
      requests,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    console.error('Get admin service requests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch service requests.' });
  }
}

// Admin: Update service request (technician assignment, cost, status, inspection)
export async function updateAdminServiceRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      status,
      assignedStaffId,
      assignedStaffName,
      inspectionDetails,
      repairNotes,
      estimatedCost,
      finalCost,
    } = req.body;

    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status: status || existing.status,
        assignedStaffId: assignedStaffId !== undefined ? assignedStaffId : existing.assignedStaffId,
        assignedStaffName: assignedStaffName !== undefined ? assignedStaffName : existing.assignedStaffName,
        inspectionDetails: inspectionDetails !== undefined ? inspectionDetails : existing.inspectionDetails,
        repairNotes: repairNotes !== undefined ? repairNotes : existing.repairNotes,
        estimatedCost: estimatedCost !== undefined ? Number(estimatedCost) : existing.estimatedCost,
        finalCost: finalCost !== undefined ? Number(finalCost) : existing.finalCost,
      },
    });

    if (existing.customerId) {
      await prisma.notification.create({
        data: {
          customerId: existing.customerId,
          title: `Service Status: ${updated.status}`,
          message: `Your service request ${existing.requestNumber} status has changed to '${updated.status}'. ${repairNotes ? 'Notes: ' + repairNotes : ''}`,
          type: 'SERVICE_UPDATE',
          link: '/account?tab=service',
        },
      });
    }

    return res.json({
      success: true,
      message: 'Service request updated successfully.',
      serviceRequest: updated,
    });
  } catch (error: any) {
    console.error('Update service request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update service request.' });
  }
}

