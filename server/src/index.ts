import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import brandsRouter from './routes/brands.js';
import bannersRouter from './routes/banners.js';
import testimonialsRouter from './routes/testimonials.js';
import newsletterRouter from './routes/newsletter.js';
import { prisma } from './prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    // Quick DB ping
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      app: 'VOLTEDGE Electronics API',
      version: '1.0.0',
      milestone: 'Milestone 1 - Website Design & Technical Foundation',
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

// Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/newsletter', newsletterRouter);

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
