import axios from 'axios';
import {
  Customer,
  CustomerAddress,
  ServerCart,
  WishlistItem,
  CustomerOrder,
  InvoiceData,
  ProductReview,
} from '../types/customer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const customerApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach Authorization Bearer Token if found in localStorage
customerApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('volt_customer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Attach guestToken for unauthenticated guest cart sessions
  let guestToken = localStorage.getItem('volt_guest_token');
  if (!guestToken) {
    guestToken = `guest_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    localStorage.setItem('volt_guest_token', guestToken);
  }
  config.headers['x-guest-token'] = guestToken;
  return config;
});

// 1. Customer Authentication APIs
export const registerCustomer = async (data: any) => {
  const res = await customerApiClient.post('/auth/register', data);
  if (res.data.token) {
    localStorage.setItem('volt_customer_token', res.data.token);
  }
  return res.data;
};

export const loginCustomer = async (data: any) => {
  const guestToken = localStorage.getItem('volt_guest_token');
  const res = await customerApiClient.post('/auth/login', { ...data, guestToken });
  if (res.data.token) {
    localStorage.setItem('volt_customer_token', res.data.token);
  }
  return res.data;
};

export const logoutCustomer = async () => {
  try {
    await customerApiClient.post('/auth/logout');
  } finally {
    localStorage.removeItem('volt_customer_token');
  }
};

export const getCustomerProfile = async (): Promise<Customer> => {
  const res = await customerApiClient.get<{ success: boolean; customer: Customer }>('/customer/profile');
  return res.data.customer;
};

export const updateCustomerProfile = async (data: Partial<Customer>) => {
  const res = await customerApiClient.put('/customer/profile', data);
  return res.data;
};

export const changeCustomerPassword = async (data: any) => {
  const res = await customerApiClient.put('/customer/change-password', data);
  return res.data;
};

export const forgotCustomerPassword = async (email: string) => {
  const res = await customerApiClient.post('/auth/forgot-password', { email });
  return res.data;
};

export const resetCustomerPassword = async (data: any) => {
  const res = await customerApiClient.post('/auth/reset-password', data);
  return res.data;
};

// 2. Customer Address APIs
export const getCustomerAddresses = async (): Promise<CustomerAddress[]> => {
  const res = await customerApiClient.get<{ success: boolean; addresses: CustomerAddress[] }>('/customer/addresses');
  return res.data.addresses;
};

export const addCustomerAddress = async (data: Partial<CustomerAddress>) => {
  const res = await customerApiClient.post('/customer/addresses', data);
  return res.data.address;
};

export const updateCustomerAddress = async (id: string, data: Partial<CustomerAddress>) => {
  const res = await customerApiClient.put(`/customer/addresses/${id}`, data);
  return res.data.address;
};

export const deleteCustomerAddress = async (id: string) => {
  const res = await customerApiClient.delete(`/customer/addresses/${id}`);
  return res.data;
};

// 3. Server Shopping Cart APIs
export const getServerCart = async (): Promise<ServerCart> => {
  const res = await customerApiClient.get<{ success: boolean; cart: ServerCart }>('/cart');
  return res.data.cart;
};

export const addServerCartItem = async (productId: string, quantity = 1) => {
  const res = await customerApiClient.post('/cart/items', { productId, quantity });
  return res.data;
};

export const updateServerCartItem = async (itemId: string, quantity: number) => {
  const res = await customerApiClient.put(`/cart/items/${itemId}`, { quantity });
  return res.data;
};

export const removeServerCartItem = async (itemId: string) => {
  const res = await customerApiClient.delete(`/cart/items/${itemId}`);
  return res.data;
};

export const clearServerCart = async () => {
  const res = await customerApiClient.delete('/cart');
  return res.data;
};

// 4. Wishlist APIs
export const getWishlist = async (): Promise<{ items: WishlistItem[]; count: number }> => {
  const res = await customerApiClient.get<{ success: boolean; wishlist: { items: WishlistItem[]; count: number } }>('/wishlist');
  return res.data.wishlist;
};

export const addToWishlist = async (productId: string) => {
  const res = await customerApiClient.post('/wishlist', { productId });
  return res.data;
};

export const removeFromWishlist = async (productId: string) => {
  const res = await customerApiClient.delete(`/wishlist/${productId}`);
  return res.data;
};

export const moveWishlistToCart = async (productId: string) => {
  const res = await customerApiClient.post('/wishlist/move-to-cart', { productId });
  return res.data;
};

// 5. Checkout & Coupon APIs
export const validateCheckout = async (data: { couponCode?: string; shippingMethod?: string }) => {
  const res = await customerApiClient.post('/checkout/validate', data);
  return res.data.summary;
};

export const applyCouponCode = async (data: { code: string; shippingMethod?: string }) => {
  const res = await customerApiClient.post('/checkout/apply-coupon', data);
  return res.data;
};

export const createCheckoutOrder = async (orderPayload: any) => {
  const res = await customerApiClient.post('/checkout/create-order', orderPayload);
  return res.data.order;
};

// 6. Payment APIs (Razorpay)
export const createRazorpayPaymentOrder = async (orderId: string) => {
  const res = await customerApiClient.post('/payments/razorpay/create-order', { orderId });
  return res.data;
};

export const verifyRazorpayPayment = async (verificationPayload: any) => {
  const res = await customerApiClient.post('/payments/razorpay/verify', verificationPayload);
  return res.data;
};

// 7. Customer Orders & Invoices
export const getCustomerOrders = async (): Promise<CustomerOrder[]> => {
  const res = await customerApiClient.get<{ success: boolean; orders: CustomerOrder[] }>('/customer/orders');
  return res.data.orders;
};

export const getCustomerOrderDetail = async (orderId: string): Promise<CustomerOrder> => {
  const res = await customerApiClient.get<{ success: boolean; order: CustomerOrder }>(`/customer/orders/${orderId}`);
  return res.data.order;
};

export const getCustomerOrderInvoice = async (orderId: string): Promise<InvoiceData> => {
  const res = await customerApiClient.get<{ success: boolean; invoice: InvoiceData }>(`/customer/orders/${orderId}/invoice`);
  return res.data.invoice;
};

// 8. Product Reviews
export const getProductReviews = async (productId: string): Promise<ProductReview[]> => {
  const res = await customerApiClient.get<{ success: boolean; reviews: ProductReview[] }>(`/products/${productId}/reviews`);
  return res.data.reviews;
};

export const submitProductReview = async (productId: string, data: { rating: number; title?: string; comment: string }) => {
  const res = await customerApiClient.post(`/products/${productId}/reviews`, data);
  return res.data;
};

// -------------------------------------------------------------
// 9. MILESTONE 4: WARRANTY CLAIMS APIS
// -------------------------------------------------------------
export const submitWarrantyClaim = async (data: any) => {
  const res = await customerApiClient.post('/warranty/claims', data);
  return res.data;
};

export const getCustomerWarrantyClaims = async () => {
  const res = await customerApiClient.get('/customer/warranty-claims');
  return res.data.claims;
};

// -------------------------------------------------------------
// 10. MILESTONE 4: REPAIR & SERVICE REQUEST APIS
// -------------------------------------------------------------
export const submitServiceRequest = async (data: any) => {
  const res = await customerApiClient.post('/service/requests', data);
  return res.data;
};

export const getCustomerServiceRequests = async () => {
  const res = await customerApiClient.get('/customer/service-requests');
  return res.data.requests;
};

// -------------------------------------------------------------
// 11. MILESTONE 4: RETURNS & REFUNDS APIS
// -------------------------------------------------------------
export const submitReturnRequest = async (data: any) => {
  const res = await customerApiClient.post('/returns/requests', data);
  return res.data;
};

export const getCustomerReturns = async () => {
  const res = await customerApiClient.get('/customer/returns');
  return res.data.returns;
};

// -------------------------------------------------------------
// 12. MILESTONE 4: ORDER DELIVERY TRACKING
// -------------------------------------------------------------
export const getOrderDeliveryTracking = async (orderId: string) => {
  const res = await customerApiClient.get(`/orders/${orderId}/delivery`);
  return res.data.delivery;
};

// -------------------------------------------------------------
// 13. MILESTONE 4: NOTIFICATIONS APIS
// -------------------------------------------------------------
export const getCustomerNotifications = async () => {
  const res = await customerApiClient.get('/customer/notifications');
  return res.data;
};

export const markCustomerNotificationRead = async (id: string) => {
  const res = await customerApiClient.patch(`/customer/notifications/${id}/read`);
  return res.data;
};

// -------------------------------------------------------------
// 14. MILESTONE 4: RECENTLY VIEWED PRODUCTS
// -------------------------------------------------------------
export const recordProductView = async (productId: string) => {
  try {
    const res = await customerApiClient.post('/products/view', { productId });
    return res.data;
  } catch (e) {
    // Silent fail if unauthenticated or error
    return null;
  }
};

export const getRecentlyViewed = async () => {
  try {
    const res = await customerApiClient.get('/customer/recently-viewed');
    return res.data.products || [];
  } catch (e) {
    return [];
  }
};


