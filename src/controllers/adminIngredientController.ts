import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';
import { parseId } from '../utils/parseId.js';
import type { CreateIngredientInput, UpdateIngredientInput } from '../schemas/ingredient.schema.js';

/**
 * GET /api/admin/ingredients
 * List all ingredients.
 */
export async function adminListIngredients(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10) || 20));
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    const where = search
      ? { name: { contains: search } }
      : {};

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.ingredient.count({ where }),
    ]);

    sendSuccess(res, ingredients, {
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
 * GET /api/admin/ingredients/:id
 */
export async function adminGetIngredient(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
          },
        },
      },
    });
    if (!ingredient) throw new AppError('NOT_FOUND', 'Ingredient not found', 404);
    sendSuccess(res, ingredient);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/ingredients
 */
export async function adminCreateIngredient(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as CreateIngredientInput;

    const existing = await prisma.ingredient.findUnique({
      where: { name: body.name },
    });
    if (existing) {
      throw new AppError('CONFLICT', 'Ingredient dengan nama ini sudah ada', 409);
    }

    const ingredient = await prisma.ingredient.create({
      data: body,
    });
    sendSuccess(res, ingredient, null, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/ingredients/:id
 */
export async function adminUpdateIngredient(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const body = req.body as UpdateIngredientInput;

    const existing = await prisma.ingredient.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 'Ingredient not found', 404);

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: body,
    });
    sendSuccess(res, ingredient);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/ingredients/:id
 * Hard delete (ingredients jarang dihapus, dan product_ingredients pakai cascade).
 */
export async function adminDeleteIngredient(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);

    const existing = await prisma.ingredient.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 'Ingredient not found', 404);

    // Cek apakah ingredient dipakai di produk
    const usageCount = await prisma.productIngredient.count({
      where: { ingredientId: id },
    });
    if (usageCount > 0) {
      throw new AppError(
        'CONFLICT',
        `Ingredient ini dipakai di ${usageCount} produk. Hapus relasinya terlebih dahulu.`,
        409
      );
    }

    await prisma.ingredient.delete({ where: { id } });
    sendSuccess(res, { id, deleted: true });
  } catch (err) {
    next(err);
  }
}