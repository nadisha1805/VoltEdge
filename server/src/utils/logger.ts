import { Request } from 'express';
import { prisma } from '../prisma.js';
import { AdminPayload } from '../types/auth.js';

export async function logActivity(
  admin: AdminPayload | undefined,
  action: string,
  module: string,
  description: string,
  metadata?: Record<string, any>,
  req?: Request
) {
  try {
    const ipAddress = req?.ip || req?.socket.remoteAddress || '127.0.0.1';
    const userAgent = req?.headers['user-agent'] || undefined;

    await prisma.activityLog.create({
      data: {
        adminUserId: admin?.id,
        adminName: admin?.fullName || 'System',
        action,
        module,
        description,
        ipAddress: typeof ipAddress === 'string' ? ipAddress : '127.0.0.1',
        userAgent,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
}

