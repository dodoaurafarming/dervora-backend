import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';
import { parseId } from '../utils/parseId.js';

export async function listIngredients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    sendSuccess(res, ingredients);
  } catch (err) {
    next(err);
  }
}

export async function getIngredient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        products: {
          include: { product: { select: { id: true, name: true, imageUrl: true } } },
        },
      },
    });
    if (!ingredient) throw new AppError('NOT_FOUND', 'Ingredient not found', 404);
    sendSuccess(res, ingredient);
  } catch (err) {
    next(err);
  }
}