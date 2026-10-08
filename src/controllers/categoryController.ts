import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';
import { parseId } from '../utils/parseId.js';

export async function listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new AppError('NOT_FOUND', 'Category not found', 404);
    sendSuccess(res, category);
  } catch (err) {
    next(err);
  }
}