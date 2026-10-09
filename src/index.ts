import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import ingredientRoutes from './routes/ingredientRoutes.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== CORS CONFIG ====================
const allowedOrigins = [
  'http://localhost:5173',      // Vite dev server
  'http://localhost:4173',      // Vite preview (production build)
  'http://localhost:3000',      // Backend itself (untuk testing)
  process.env.FRONTEND_URL || '', // GitHub Pages / production
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests tanpa origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`⚠️  CORS blocked: ${origin}`);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    meta: null,
  });
});

// ==================== ROUTES ====================
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ingredients', ingredientRoutes);

// ==================== ERROR HANDLERS (HARUS di akhir) ====================
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 CORS allowed origins:`, allowedOrigins);
});