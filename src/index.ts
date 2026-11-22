import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import ingredientRoutes from './routes/ingredientRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminIngredientRoutes from './routes/adminIngredientRoutes.js';
import ingredientCatalogRoutes from './routes/ingredientCatalogRoutes.js';
import adminIngredientCatalogRoutes from './routes/adminIngredientCatalogRoutes.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/errorHandler.js';
import routineRoutes from './routes/routineRoutes.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'https://dodoaurafarming.github.io',
  'https://dervorayourskin.com',
  'https://www.dervorayourskin.com',
  (process.env.FRONTEND_URL || '').replace(/\/$/, ''),
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      corsAllowedOrigins: allowedOrigins,
    },
    meta: null,
  });
});

app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', uploadRoutes);
app.use('/api/admin/ingredients', adminIngredientRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/ingredient-catalog', adminIngredientCatalogRoutes);
app.use('/api/ingredient-catalog', ingredientCatalogRoutes);
app.use('/api/routine', routineRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌐 CORS allowed origins:`, allowedOrigins);
  });
}

export default app;