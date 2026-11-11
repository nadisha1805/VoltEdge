import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

// Get delivery tracking for an order (Customer & Admin)
export async function getOrderDeliveryTracking(req: Request, res: Response) {
  try {
    const { orderId } = req.params;

    const delivery = await prisma.deliveryTracking.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            shippingAddress: true,
            orderStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery tracking information not found.' });
    }

    let parsedTimeline: any[] = [];
    if (delivery.timeline) {
      try {
        parsedTimeline = JSON.parse(delivery.timeline);
      } catch (e) {
        parsedTimeline = [];
      }
    }

    return res.json({
      success: true,
      delivery: {
        ...delivery,
        parsedTimeline,
      },
    });
  } catch (error: any) {
    console.error('Get delivery tracking error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch delivery details.' });
  }
}

// Update or create delivery tracking info (Admin)
export async function updateOrderDeliveryTracking(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const {
      shippingProvider,
      trackingNumber,
      trackingUrl,
      dispatchDate,
      expectedDeliveryDate,
      deliveredDate,
      deliveryStatus,
      deliveryNotes,
      statusUpdateComment,
      location,
    } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    let existing = await prisma.deliveryTracking.findUnique({ where: { orderId } });

    let timeline: any[] = [];
    if (existing?.timeline) {
      try {
        timeline = JSON.parse(existing.timeline);
      } catch (e) {
        timeline = [];
      }
    }

    const currentStatus = deliveryStatus || existing?.deliveryStatus || 'Processing';
    
    // Append new timeline entry if status is being updated or comment provided
    if (statusUpdateComment || deliveryStatus) {
      timeline.push({
        status: currentStatus,
        notes: statusUpdateComment || deliveryNotes || `Status changed to ${currentStatus}`,
        location: location || 'Bangalore Hub',
        timestamp: new Date().toISOString(),
      });
    }

    const delivery = await prisma.deliveryTracking.upsert({
      where: { orderId },
      create: {
        orderId,
        shippingProvider: shippingProvider || 'VOLTEDGE Express',
        trackingNumber: trackingNumber || `TRK${Date.now()}`,
        trackingUrl: trackingUrl || null,
        dispatchDate: dispatchDate ? new Date(dispatchDate) : new Date(),
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        deliveredDate: deliveredDate ? new Date(deliveredDate) : null,
        deliveryStatus: currentStatus,
        deliveryNotes: deliveryNotes || null,
        timeline: JSON.stringify(timeline),
      },
      update: {
        shippingProvider: shippingProvider !== undefined ? shippingProvider : existing?.shippingProvider,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : existing?.trackingNumber,
        trackingUrl: trackingUrl !== undefined ? trackingUrl : existing?.trackingUrl,
        dispatchDate: dispatchDate ? new Date(dispatchDate) : existing?.dispatchDate,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : existing?.expectedDeliveryDate,
        deliveredDate: deliveredDate ? new Date(deliveredDate) : existing?.deliveredDate,
        deliveryStatus: currentStatus,
        deliveryNotes: deliveryNotes !== undefined ? deliveryNotes : existing?.deliveryNotes,
        timeline: JSON.stringify(timeline),
      },
    });

    // Sync orderStatus if delivered or dispatched
    if (currentStatus === 'Delivered') {
      await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: 'DELIVERED' },
      });
    } else if (currentStatus === 'Dispatched' || currentStatus === 'In Transit') {
      await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: 'SHIPPED' },
      });
    }

    // Customer Notification
    if (order.customerId) {
      await prisma.notification.create({
        data: {
          customerId: order.customerId,
          title: `Delivery Update: ${currentStatus}`,
          message: `Order ${order.orderNumber} is currently '${currentStatus}'. ${trackingNumber ? `Tracking #: ${trackingNumber}` : ''}`,
          type: 'ORDER_UPDATE',
          link: `/orders/${order.id}`,
        },
      });
    }

    return res.json({
      success: true,
      message: 'Delivery tracking updated successfully.',
      delivery,
    });
  } catch (error: any) {
    console.error('Update delivery tracking error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update delivery tracking.' });
  }
}

