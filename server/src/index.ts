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
