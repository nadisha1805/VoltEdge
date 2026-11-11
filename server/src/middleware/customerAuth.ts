import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

export interface CustomerAuthPayload {
  customerId: string;
  email: string;
  fullName: string;
}

export interface CustomerAuthRequest extends Request {
  customer?: CustomerAuthPayload;
}

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET || 'voltedge-customer-auth-jwt-secret-m3-2026';

export const requireCustomerAuth = async (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check signed or unsigned cookies
    else if (req.cookies && req.cookies.volt_customer_token) {
      token = req.cookies.volt_customer_token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to your VOLTEDGE customer account.',
      });
      return;
    }

    const decoded = jwt.verify(token, CUSTOMER_JWT_SECRET) as CustomerAuthPayload;

    // Verify customer still exists and is ACTIVE
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.customerId },
      select: { id: true, email: true, firstName: true, lastName: true, status: true, isArchived: true },
    });

    if (!customer || customer.isArchived || customer.status === 'BLOCKED') {
      res.status(401).json({
        success: false,
        message: 'Customer account is inactive, blocked, or no longer exists.',
      });
      return;
    }

    req.customer = {
      customerId: customer.id,
      email: customer.email,
      fullName: `${customer.firstName} ${customer.lastName}`.trim(),
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired customer session. Please log in again.',
    });
  }
};

// Optional auth for guest/customer hybrid endpoints (like cart)
export const optionalCustomerAuth = async (
  req: CustomerAuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.volt_customer_token) {
      token = req.cookies.volt_customer_token;
    }

    if (token) {
      const decoded = jwt.verify(token, CUSTOMER_JWT_SECRET) as CustomerAuthPayload;
      const customer = await prisma.customer.findUnique({
        where: { id: decoded.customerId },
        select: { id: true, email: true, firstName: true, lastName: true, status: true, isArchived: true },
      });
      if (customer && !customer.isArchived && customer.status !== 'BLOCKED') {
        req.customer = {
          customerId: customer.id,
          email: customer.email,
          fullName: `${customer.firstName} ${customer.lastName}`.trim(),
        };
      }
    }
  } catch {
    // Ignore invalid token on optional auth
  }
  next();
};

export const generateCustomerToken = (payload: CustomerAuthPayload): string => {
  return jwt.sign(payload, CUSTOMER_JWT_SECRET, { expiresIn: '7d' });
};

