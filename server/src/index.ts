import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

// Public Routers
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import brandsRouter from './routes/brands.js';
import bannersRouter from './routes/banners.js';
import testimonialsRouter from './routes/testimonials.js';
import newsletterRouter from './routes/newsletter.js';
import enquiriesRouter from './routes/enquiries.js';

// Milestone 3: Customer Portal, Cart, Wishlist, Checkout, Payments & Reviews Routers
import customerAuthRouter from './routes/customerAuth.js';
import customerProfileRouter from './routes/customerProfile.js';
import cartRouter from './routes/cart.js';
import wishlistRouter from './routes/wishlist.js';
import checkoutRouter from './routes/checkout.js';
import paymentsRouter from './routes/payments.js';
import customerOrdersRouter from './routes/customerOrders.js';
import reviewsRouter from './routes/reviews.js';

// Milestone 4: Advanced Features & Workflows
import {
  submitWarrantyClaim,
  getCustomerWarrantyClaims,
  getAdminWarrantyClaims,
  updateAdminWarrantyClaim,
} from './routes/warranty.js';
import {
  submitServiceRequest,
  getCustomerServiceRequests,
  getAdminServiceRequests,
  updateAdminServiceRequest,
} from './routes/service.js';
import {
  submitReturnRequest,
  getCustomerReturns,
  getAdminReturns,
  updateAdminReturnStatus,
  processAdminRefund,
} from './routes/returns.js';
import {
  getOrderDeliveryTracking,
  updateOrderDeliveryTracking,
} from './routes/delivery.js';
import {
  getCustomerNotifications,
  markCustomerNotificationRead,
  getAdminNotifications,
  markAdminNotificationRead,
} from './routes/notifications.js';
import {
  recordProductView,
  getRecentlyViewed,
} from './routes/recentlyViewed.js';
import { verifyCustomerToken } from './middleware/customerAuth.js';
import { verifyAdminToken } from './middleware/auth.js';

// Admin Routers
import adminAuthRouter from './routes/admin/auth.js';
import adminDashboardRouter from './routes/admin/dashboard.js';
import adminProductsRouter from './routes/admin/products.js';
import adminCategoriesRouter from './routes/admin/categories.js';
import adminBrandsRouter from './routes/admin/brands.js';
import adminInventoryRouter from './routes/admin/inventory.js';
import adminOrdersRouter from './routes/admin/orders.js';
import adminCustomersRouter from './routes/admin/customers.js';
import adminCouponsRouter from './routes/admin/coupons.js';
import adminStaffRouter from './routes/admin/staff.js';
import adminEnquiriesRouter from './routes/admin/enquiries.js';
import adminNewsletterRouter from './routes/admin/newsletter.js';
import adminReportsRouter from './routes/admin/reports.js';
import adminSettingsRouter from './routes/admin/settings.js';

import { prisma } from './prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static assets
const uploadsPath = path.resolve(process.cwd(), 'public', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      app: 'VOLTEDGE Electronics API',
      version: '2.0.0',
      milestone: 'Milestone 2 - Admin Dashboard & Showroom Management',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      app: 'VOLTEDGE Electronics API',
      error: 'Database connection failed',
    });
  }
});

// 1. Customer-Facing Storefront Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/enquiries', enquiriesRouter);

// Milestone 3: Customer Portal & E-Commerce APIs
app.use('/api/auth', customerAuthRouter);
app.use('/api/customer', customerProfileRouter);
app.use('/api/cart', cartRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/customer/orders', customerOrdersRouter);
app.use('/api/products', reviewsRouter); // For /api/products/:productId/reviews
app.use('/api/reviews', reviewsRouter); // For /api/reviews/:id

// Milestone 4: Customer APIs
app.post('/api/warranty/claims', verifyCustomerToken, submitWarrantyClaim);
app.get('/api/customer/warranty-claims', verifyCustomerToken, getCustomerWarrantyClaims);

app.post('/api/service/requests', verifyCustomerToken, submitServiceRequest);
app.get('/api/customer/service-requests', verifyCustomerToken, getCustomerServiceRequests);

app.post('/api/returns/requests', verifyCustomerToken, submitReturnRequest);
app.get('/api/customer/returns', verifyCustomerToken, getCustomerReturns);

app.get('/api/orders/:orderId/delivery', getOrderDeliveryTracking);

app.get('/api/customer/notifications', verifyCustomerToken, getCustomerNotifications);
app.patch('/api/customer/notifications/:id/read', verifyCustomerToken, markCustomerNotificationRead);

app.post('/api/products/view', recordProductView);
app.get('/api/customer/recently-viewed', verifyCustomerToken, getRecentlyViewed);

// 2. Admin Management Routes
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/dashboard', adminDashboardRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/categories', adminCategoriesRouter);
app.use('/api/admin/brands', adminBrandsRouter);
app.use('/api/admin/inventory', adminInventoryRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.use('/api/admin/customers', adminCustomersRouter);
app.use('/api/admin/coupons', adminCouponsRouter);
app.use('/api/admin/staff', adminStaffRouter);
app.use('/api/admin/enquiries', adminEnquiriesRouter);
app.use('/api/admin/newsletter', adminNewsletterRouter);
app.use('/api/admin/reports', adminReportsRouter);
app.use('/api/admin/settings', adminSettingsRouter);

// Milestone 4: Admin Management APIs
app.get('/api/admin/warranty/claims', verifyAdminToken, getAdminWarrantyClaims);
app.patch('/api/admin/warranty/claims/:id', verifyAdminToken, updateAdminWarrantyClaim);

app.get('/api/admin/service/requests', verifyAdminToken, getAdminServiceRequests);
app.patch('/api/admin/service/requests/:id', verifyAdminToken, updateAdminServiceRequest);

app.get('/api/admin/returns', verifyAdminToken, getAdminReturns);
app.patch('/api/admin/returns/:id', verifyAdminToken, updateAdminReturnStatus);
app.post('/api/admin/refunds/process', verifyAdminToken, processAdminRefund);

app.patch('/api/admin/orders/:orderId/delivery', verifyAdminToken, updateOrderDeliveryTracking);

app.get('/api/admin/notifications', verifyAdminToken, getAdminNotifications);
app.patch('/api/admin/notifications/:id/read', verifyAdminToken, markAdminNotificationRead);

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

app.listen(PORT, () => {
  console.log(`⚡ VOLTEDGE Electronics Backend running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

export default app;
