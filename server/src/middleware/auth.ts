import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { AdminPayload, AdminRole, AuthenticatedRequest } from '../types/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'voltedge-super-secret-jwt-key-milestone-2-2026';

export function generateToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyAdminToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    // Check Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No valid administrator session found.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;

    // Verify user exists and is active in database
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Staff account is inactive or no longer authorized.',
      });
    }

    req.admin = {
      id: user.id,
      email: user.email,
      role: user.role as AdminRole,
      fullName: user.fullName,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Administrator session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or forged authentication token.',
    });
  }
}

export function requireRole(allowedRoles: AdminRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Super Admin has universal permission
    if (req.admin.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Staff role "${req.admin.role}" lacks permission for this operation.`,
      });
    }

    next();
  };
}

// In-memory rate limiter for login protection
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function loginRateLimiter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  const record = loginAttempts.get(ip);
  if (record) {
    if (now - record.lastAttempt > windowMs) {
      loginAttempts.set(ip, { count: 1, lastAttempt: now });
    } else {
      if (record.count >= maxAttempts) {
        return res.status(429).json({
          success: false,
          message: 'Too many failed login attempts. Please wait 15 minutes before trying again.',
        });
      }
      record.count += 1;
      record.lastAttempt = now;
      loginAttempts.set(ip, record);
    }
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
  }

  next();
}

export function resetLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

