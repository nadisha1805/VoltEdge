import { Request } from 'express';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'INVENTORY_MANAGER' | 'SALES_STAFF';

export interface AdminPayload {
  id: string;
  email: string;
  role: AdminRole;
  fullName: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminPayload;
}

