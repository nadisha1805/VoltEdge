import axios from 'axios';
import {
  AdminUser,
  DashboardOverview,
  ActivityLog,
  InventoryOverview,
  InventoryMovement,
  Customer,
  Order,
  Coupon,
  ContactEnquiry,
  NewsletterSubscriber,
  ShowroomSettings,
} from '../types/admin';
import { Product, Category, Brand } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const adminClient = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: attach token from localStorage if present
adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('voltedge_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      localStorage.removeItem('voltedge_admin_token');
      localStorage.removeItem('voltedge_admin_user');
      window.location.href = '/admin/login?session_expired=true';
    }
    return Promise.reject(error);
  }
);

// ---------------- AUTH APIS ----------------
export const adminLogin = async (credentials: { email: string; password: string }) => {
  const res = await adminClient.post<{ success: boolean; token: string; user: AdminUser }>('/auth/login', credentials);
  return res.data;
};

export const adminLogout = async () => {
  const res = await adminClient.post<{ success: boolean }>('/auth/logout');
  return res.data;
};

export const getAdminProfile = async () => {
  const res = await adminClient.get<{ success: boolean; user: AdminUser }>('/auth/me');
  return res.data.user;
};

export const updateAdminPassword = async (data: { currentPassword: string; newPassword: string }) => {
  const res = await adminClient.put<{ success: boolean; message: string }>('/auth/password', data);
  return res.data;
};

// ---------------- DASHBOARD APIS ----------------
export const getDashboardOverview = async () => {
  const res = await adminClient.get<{ success: boolean; data: DashboardOverview }>('/dashboard/overview');
  return res.data.data;
};

export const getDashboardAnalytics = async () => {
  const res = await adminClient.get<{ success: boolean; data: any }>('/dashboard/analytics');
  return res.data.data;
};

export const getRecentActivity = async () => {
  const res = await adminClient.get<{ success: boolean; data: ActivityLog[] }>('/dashboard/recent-activity');
  return res.data.data;
};

// ---------------- PRODUCTS APIS ----------------
export const getAdminProducts = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get<{ success: boolean; data: Product[]; pagination: any }>('/products', { params });
  return res.data;
};

export const getAdminProductById = async (id: string) => {
  const res = await adminClient.get<{ success: boolean; data: Product }> (`/products/${id}`);
  return res.data.data;
};

export const createAdminProduct = async (productData: any) => {
  const res = await adminClient.post<{ success: boolean; data: Product }>('/products', productData);
  return res.data;
};

export const updateAdminProduct = async (id: string, productData: any) => {
  const res = await adminClient.put<{ success: boolean; data: Product }>(`/products/${id}`, productData);
  return res.data;
};

export const deleteAdminProduct = async (id: string) => {
  const res = await adminClient.delete<{ success: boolean; message: string; archived?: boolean }>(`/products/${id}`);
  return res.data;
};

export const uploadProductImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const res = await adminClient.post<{ success: boolean; imageUrls: string[] }>('/products/upload-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.imageUrls;
};

// ---------------- CATEGORIES APIS ----------------
export const getAdminCategories = async () => {
  const res = await adminClient.get<{ success: boolean; data: (Category & { productCount: number; parent?: any; children?: any[] })[] }>('/categories');
  return res.data.data;
};

export const createAdminCategory = async (data: any) => {
  const res = await adminClient.post<{ success: boolean; data: Category }>('/categories', data);
  return res.data;
};

export const updateAdminCategory = async (id: string, data: any) => {
  const res = await adminClient.put<{ success: boolean; data: Category }>(`/categories/${id}`, data);
  return res.data;
};

export const deleteAdminCategory = async (id: string, reassignToCategoryId?: string) => {
  const res = await adminClient.delete<{ success: boolean; message: string }>(`/categories/${id}`, {
    data: { reassignToCategoryId },
  });
  return res.data;
};

// ---------------- BRANDS APIS ----------------
export const getAdminBrands = async () => {
  const res = await adminClient.get<{ success: boolean; data: (Brand & { productCount: number })[] }>('/brands');
  return res.data.data;
};

export const createAdminBrand = async (data: any) => {
  const res = await adminClient.post<{ success: boolean; data: Brand }>('/brands', data);
  return res.data;
};

export const updateAdminBrand = async (id: string, data: any) => {
  const res = await adminClient.put<{ success: boolean; data: Brand }>(`/brands/${id}`, data);
  return res.data;
};

export const deleteAdminBrand = async (id: string) => {
  const res = await adminClient.delete<{ success: boolean; message: string }>(`/brands/${id}`);
  return res.data;
};

// ---------------- INVENTORY APIS ----------------
export const getInventoryOverview = async () => {
  const res = await adminClient.get<{ success: boolean; data: InventoryOverview }>('/inventory/overview');
  return res.data.data;
};

export const getInventoryList = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get<{ success: boolean; data: any[]; pagination: any }>('/inventory', { params });
  return res.data;
};

export const adjustStock = async (data: {
  productId: string;
  quantityChanged: number;
  movementType: string;
  reason: string;
  referenceNumber?: string;
}) => {
  const res = await adminClient.post<{ success: boolean; data: any }>('/inventory/adjust', data);
  return res.data;
};

export const getInventoryMovements = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get<{ success: boolean; data: InventoryMovement[]; pagination: any }>('/inventory/movements', { params });
  return res.data;
};

// ---------------- ORDERS APIS ----------------
export const getAdminOrders = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get<{ success: boolean; data: Order[]; pagination: any }>('/orders', { params });
  return res.data;
};

export const getAdminOrderById = async (id: string) => {
  const res = await adminClient.get<{ success: boolean; data: Order }>(`/orders/${id}`);
  return res.data.data;
};

export const updateOrderStatus = async (id: string, data: { orderStatus?: string; paymentStatus?: string; comment?: string }) => {
  const res = await adminClient.patch<{ success: boolean; data: Order }>(`/orders/${id}/status`, data);
  return res.data;
};

// ---------------- CUSTOMERS APIS ----------------
export const getAdminCustomers = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get<{ success: boolean; data: Customer[]; pagination: any }>('/customers', { params });
  return res.data;
};

export const getAdminCustomerById = async (id: string) => {
  const res = await adminClient.get<{ success: boolean; data: Customer }>(`/customers/${id}`);
  return res.data.data;
};

export const updateAdminCustomer = async (id: string, data: any) => {
  const res = await adminClient.put<{ success: boolean; data: Customer }>(`/customers/${id}`, data);
  return res.data;
};

// ---------------- COUPONS APIS ----------------
export const getAdminCoupons = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get<{ success: boolean; data: Coupon[] }>('/coupons', { params });
  return res.data.data;
};

export const createAdminCoupon = async (data: any) => {
  const res = await adminClient.post<{ success: boolean; data: Coupon }>('/coupons', data);
  return res.data;
};

export const updateAdminCoupon = async (id: string, data: any) => {
  const res = await adminClient.put<{ success: boolean; data: Coupon }>(`/coupons/${id}`, data);
  return res.data;
};

export const deleteAdminCoupon = async (id: string) => {
  const res = await adminClient.delete<{ success: boolean }>('/coupons/' + id);
  return res.data;
};

// ---------------- STAFF APIS ----------------
export const getAdminStaffList = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get<{ success: boolean; data: AdminUser[] }>('/staff', { params });
  return res.data.data;
};

export const createAdminStaff = async (data: any) => {
  const res = await adminClient.post<{ success: boolean; data: AdminUser }>('/staff', data);
  return res.data;
};

export const updateAdminStaff = async (id: string, data: any) => {
  const res = await adminClient.put<{ success: boolean; data: AdminUser }>(`/staff/${id}`, data);
  return res.data;
};

export const toggleAdminStaffStatus = async (id: string, isActive: boolean) => {
  const res = await adminClient.patch<{ success: boolean; data: AdminUser }>(`/staff/${id}/status`, { isActive });
  return res.data;
};

export const resetStaffPassword = async (id: string, newPassword: string) => {
  const res = await adminClient.post<{ success: boolean; message: string }>(`/staff/${id}/reset-password`, { newPassword });
  return res.data;
};

// ---------------- ENQUIRIES APIS ----------------
export const getAdminEnquiries = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get<{ success: boolean; data: ContactEnquiry[]; pagination: any }>('/enquiries', { params });
  return res.data;
};

export const updateEnquiryStatus = async (id: string, data: { status?: string; adminNotes?: string }) => {
  const res = await adminClient.patch<{ success: boolean; data: ContactEnquiry }>(`/enquiries/${id}/status`, data);
  return res.data;
};

export const deleteEnquiry = async (id: string) => {
  const res = await adminClient.delete<{ success: boolean }>(`/enquiries/${id}`);
  return res.data;
};

// ---------------- NEWSLETTER APIS ----------------
export const getAdminNewsletterSubscribers = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get<{ success: boolean; data: NewsletterSubscriber[]; pagination: any }>('/newsletter', { params });
  return res.data;
};

export const toggleNewsletterStatus = async (id: string, isActive: boolean) => {
  const res = await adminClient.patch<{ success: boolean; data: NewsletterSubscriber }>(`/newsletter/${id}/status`, { isActive });
  return res.data;
};

export const deleteNewsletterSubscriber = async (id: string) => {
  const res = await adminClient.delete<{ success: boolean }>(`/newsletter/${id}`);
  return res.data;
};

// ---------------- REPORTS APIS ----------------
export const getReportsSummary = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get<{ success: boolean; data: any }>('/reports/summary', { params });
  return res.data.data;
};

export const getReportData = async (type: string, params: Record<string, any> = {}) => {
  const res = await adminClient.get<{ success: boolean; data: any[] }>(`/reports/${type}`, { params });
  return res.data.data;
};

// ---------------- SETTINGS APIS ----------------
export const getShowroomSettings = async () => {
  const res = await adminClient.get<{ success: boolean; data: ShowroomSettings }>('/settings');
  return res.data.data;
};

export const updateShowroomSettings = async (data: Partial<ShowroomSettings>) => {
  const res = await adminClient.put<{ success: boolean; data: ShowroomSettings }>('/settings', data);
  return res.data;
};

// -------------------------------------------------------------
// MILESTONE 4: WARRANTY CLAIMS ADMIN APIS
// -------------------------------------------------------------
export const getAdminWarrantyClaims = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get('/warranty/claims', { params });
  return res.data;
};

export const updateAdminWarrantyClaim = async (id: string, data: any) => {
  const res = await adminClient.patch(`/warranty/claims/${id}`, data);
  return res.data;
};

// -------------------------------------------------------------
// MILESTONE 4: REPAIR & SERVICE ADMIN APIS
// -------------------------------------------------------------
export const getAdminServiceRequests = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get('/service/requests', { params });
  return res.data;
};

export const updateAdminServiceRequest = async (id: string, data: any) => {
  const res = await adminClient.patch(`/service/requests/${id}`, data);
  return res.data;
};

// -------------------------------------------------------------
// MILESTONE 4: RETURNS & REFUNDS ADMIN APIS
// -------------------------------------------------------------
export const getAdminReturns = async (params: Record<string, any> = {}) => {
  const res = await adminClient.get('/returns', { params });
  return res.data;
};

export const updateAdminReturnStatus = async (id: string, data: any) => {
  const res = await adminClient.patch(`/returns/${id}`, data);
  return res.data;
};

export const processAdminRefund = async (data: any) => {
  const res = await adminClient.post('/refunds/process', data);
  return res.data;
};

// -------------------------------------------------------------
// MILESTONE 4: DELIVERY TRACKING ADMIN APIS
// -------------------------------------------------------------
export const updateOrderDeliveryTracking = async (orderId: string, data: any) => {
  const res = await adminClient.patch(`/orders/${orderId}/delivery`, data);
  return res.data;
};

// -------------------------------------------------------------
// MILESTONE 4: ADMIN NOTIFICATION APIS
// -------------------------------------------------------------
export const getAdminNotifications = async () => {
  const res = await adminClient.get('/notifications');
  return res.data;
};

export const markAdminNotificationRead = async (id: string) => {
  const res = await adminClient.patch(`/notifications/${id}/read`);
  return res.data;
};


