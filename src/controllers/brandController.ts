import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';
import { parseId } from '../utils/parseId.js'
import type { CreateBrandInput, UpdateBrandInput } from '../schemas/brand.schema.js';

export async function listBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.brand.count({ where: { deletedAt: null } }),
    ]);

    sendSuccess(res, brands, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const brand = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
      include: { products: { where: { deletedAt: null }, take: 10 } },
    });
    if (!brand) throw new AppError('NOT_FOUND', 'Brand not found', 404);
    sendSuccess(res, brand);
  } catch (err) {
    next(err);
  }
}

export async function createBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as CreateBrandInput;
    const existing = await prisma.brand.findFirst({ where: { name: body.name } });
    if (existing) throw new AppError('CONFLICT', 'Brand name already exists', 409);

    const brand = await prisma.brand.create({ data: body });
    sendSuccess(res, brand, null, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const body = req.body as UpdateBrandInput;

    const existing = await prisma.brand.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('NOT_FOUND', 'Brand not found', 404);

    const brand = await prisma.brand.update({ where: { id }, data: body });
    sendSuccess(res, brand);
  } catch (err) {
    next(err);
  }
}

export async function deleteBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.brand.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('NOT_FOUND', 'Brand not found', 404);

    await prisma.brand.update({ where: { id }, data: { deletedAt: new Date() } });
    sendSuccess(res, { id, deleted: true });
  } catch (err) {
    next(err);
  }
}