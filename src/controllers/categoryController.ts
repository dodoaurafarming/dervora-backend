import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';
import { parseId } from '../utils/parseId.js';

// ==================== ZOD SCHEMA ====================
const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  iconUrl: z.string().url().max(500).optional(),
});

// ==================== LIST CATEGORIES ====================
export async function listCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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

// ==================== GET CATEGORY BY ID ====================
export async function getCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new AppError('NOT_FOUND', 'Category not found', 404);
    sendSuccess(res, category);
  } catch (err) {
    next(err);
  }
}

// ==================== CREATE CATEGORY ====================
export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, details);
      return;
    }

    const { name, description, iconUrl } = parsed.data;

    // Cek duplikat nama
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      throw new AppError('CONFLICT', 'Kategori dengan nama ini sudah ada', 409);
    }

    const category = await prisma.category.create({
      data: { name, description, iconUrl },
    });

    sendSuccess(res, category, null, 201);
  } catch (err) {
    next(err);
  }
}