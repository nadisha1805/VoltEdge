import { Product } from './index';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  status: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  fullName?: string;
  phone?: string;
  addressType: string; // 'HOME' | 'WORK' | 'OTHER'
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface ServerCartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  primaryImage: string;
  unitPrice: number;
  originalPrice?: number | null;
  quantity: number;
  totalPrice: number;
  stockQuantity: number;
  stockStatus: string;
  isAvailable: boolean;
}

export interface ServerCart {
  id?: string;
  items: ServerCartItem[];
  itemCount: number;
  subtotal: number;
  estimatedTax: number;
  estimatedShipping: number;
  total: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export interface OrderItem {
  id: string;
  productId?: string | null;
  productName: string;
  productSku: string;
  productImageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderStatusHistoryItem {
  id: string;
  status: string;
  comment?: string | null;
  updatedBy: string;
  createdAt: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: string;
  billingAddress?: string | null;
  shippingMethod: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentReference?: string | null;
  orderStatus: string;
  notes?: string | null;
  couponCode?: string | null;
  createdAt: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistoryItem[];
  payment?: {
    id: string;
    status: string;
    method: string;
    razorpayPaymentId?: string | null;
  };
}

export interface InvoiceData {
  invoiceNumber: string;
  issuedAt: string;
  orderNumber: string;
  orderDate: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference: string;
  seller: {
    name: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
    gstin: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    shippingAddress: string;
    billingAddress: string;
  };
  items: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  pricing: {
    subtotal: number;
    discountAmount: number;
    couponCode?: string | null;
    taxAmount: number;
    shippingFee: number;
    totalAmount: number;
  };
}

export interface ProductReview {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
}

