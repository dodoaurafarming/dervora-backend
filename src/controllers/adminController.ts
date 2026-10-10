import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';
import { parseId } from '../utils/parseId.js';

/**
 * GET /api/admin/products
 * List ALL products (including soft-deleted) dengan pagination + search.
 */
export async function adminListProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10) || 20));
    const search = (req.query.search as string) || '';
    const includeDeleted = req.query.includeDeleted === 'true';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (search) {
      where.name = { contains: search };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          brand: true,
          category: true,
          ingredients: { include: { ingredient: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    sendSuccess(res, products, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/products/:id
 * Get single product (including soft-deleted).
 */
export async function adminGetProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        ingredients: { include: { ingredient: true } },
      },
    });

    if (!product) throw new AppError('NOT_FOUND', 'Product not found', 404);

    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/stats
 * Dashboard stats: total products, brands, categories, ingredients.
 */
export async function adminStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [totalProducts, totalBrands, totalCategories, totalIngredients, deletedProducts] =
      await Promise.all([
        prisma.product.count({ where: { deletedAt: null } }),
        prisma.brand.count({ where: { deletedAt: null } }),
        prisma.category.count(),
        prisma.ingredient.count(),
        prisma.product.count({ where: { NOT: { deletedAt: null } } }),
      ]);

    sendSuccess(res, {
      totalProducts,
      totalBrands,
      totalCategories,
      totalIngredients,
      deletedProducts,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/products/:id/restore
 * Restore soft-deleted product.
 */
export async function adminRestoreProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 'Product not found', 404);
    if (!existing.deletedAt) {
      throw new AppError('VALIDATION_ERROR', 'Product is not deleted', 400);
    }

    const product = await prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    });

    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
}