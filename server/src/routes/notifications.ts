import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

// Customer: Get notifications
export async function getCustomerNotifications(req: Request, res: Response) {
  try {
    const customer = (req as any).customer;
    if (!customer?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const notifications = await prisma.notification.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { customerId: customer.id, isRead: false },
    });

    return res.json({ success: true, notifications, unreadCount });
  } catch (error: any) {
    console.error('Get customer notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
}

// Customer: Mark notification as read
export async function markCustomerNotificationRead(req: Request, res: Response) {
  try {
    const customer = (req as any).customer;
    const { id } = req.params;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { customerId: customer.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      return res.json({ success: true, message: 'All notifications marked as read.' });
    }

    await prisma.notification.updateMany({
      where: { id, customerId: customer.id },
      data: { isRead: true, readAt: new Date() },
    });

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark notification.' });
  }
}

// Admin: Get notifications
export async function getAdminNotifications(_req: Request, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { customerId: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { customerId: null, isRead: false },
    });

    return res.json({ success: true, notifications, unreadCount });
  } catch (error: any) {
    console.error('Get admin notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin notifications.' });
  }
}

// Admin: Mark notification as read
export async function markAdminNotificationRead(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { customerId: null, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      return res.json({ success: true, message: 'All admin notifications marked as read.' });
    }

    await prisma.notification.updateMany({
      where: { id, customerId: null },
      data: { isRead: true, readAt: new Date() },
    });

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    console.error('Mark admin notification read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark admin notification.' });
  }
}

