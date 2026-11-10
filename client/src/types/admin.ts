export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'INVENTORY_MANAGER' | 'SALES_STAFF';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: AdminRole;
  avatar?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface DashboardOverview {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  pendingEnquiries: number;
}

export interface ActivityLog {
  id: string;
  adminUserId?: string | null;
  adminName?: string | null;
  action: string;
  module: string;
  description: string;
  ipAddress?: string | null;
  metadata?: string | null;
  createdAt: string;
  adminUser?: {
    id: string;
    fullName: string;
    role: AdminRole;
    avatar?: string | null;
  } | null;
}

export interface InventoryOverview {
  totalStockUnits: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  valuationMethod: string;
  inventoryCostValuation: number;
  inventoryRetailValuation: number;
  lowStockThreshold: number;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  previousQuantity: number;
  quantityChanged: number;
  newQuantity: number;
  movementType: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'RETURN_RESTOCK' | 'CORRECTION';
  reason: string;
  referenceNumber?: string | null;
  adminUserId?: string | null;
  updatedBy: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    primaryImage: string;
  };
}

export interface CustomerAddress {
  id: string;
  addressType: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  totalOrders: number;
  totalSpent: number;
  notes?: string | null;
  isArchived: boolean;
  createdAt: string;
  addresses?: CustomerAddress[];
  orders?: Order[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  productName: string;
  productSku: string;
  productImageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    sku: string;
    primaryImage: string;
    stockQuantity: number;
  };
}

export interface OrderStatusHistory {
  id: string;
  status: string;
  comment?: string | null;
  updatedBy: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: string;
  billingAddress?: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentMethod: string;
  paymentReference?: string | null;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  notes?: string | null;
  couponCode?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  perCustomerLimit: number;
  usageCount: number;
  startDate: string;
  expiryDate?: string | null;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';
  adminNotes?: string | null;
  respondedAt?: string | null;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

export interface ShowroomSettings {
  id: string;
  storeName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  businessHours: string;
  currency: string;
  currencySymbol: string;
  lowStockThreshold: number;
  taxRate: number;
}

