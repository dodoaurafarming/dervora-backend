import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';
import { parseId } from '../utils/parseId.js';

// GET /api/admin/ingredient-catalog
export async function adminListCatalog(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10) || 20));
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    const where = search ? { name: { contains: search } } : {};

    const [catalogs, total] = await Promise.all([
      prisma.ingredientCatalog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.ingredientCatalog.count({ where }),
    ]);

    sendSuccess(res, catalogs, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/ingredient-catalog
export async function adminCreateCatalog(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body;
    
    const existing = await prisma.ingredientCatalog.findUnique({
      where: { name: body.name },
    });
    if (existing) {
      throw new AppError('CONFLICT', 'Catalog dengan nama ini sudah ada', 409);
    }

    const catalog = await prisma.ingredientCatalog.create({
      data: {
        name: body.name,
        photoUrl: body.photoUrl || null,
        description: body.description || null,
        sourceLink: body.sourceLink || null,
        commonUses: body.commonUses || [],
        allergyPotential: body.allergyPotential || null,
        skinTypeSummary: body.skinTypeSummary || null,
        riskBenefit: body.riskBenefit || null,
        category: body.category || null,
      },
    });
    
    sendSuccess(res, catalog, null, 201);
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/ingredient-catalog/:id
export async function adminUpdateCatalog(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const body = req.body;

    const existing = await prisma.ingredientCatalog.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 'Catalog tidak ditemukan', 404);

    const catalog = await prisma.ingredientCatalog.update({
      where: { id },
      data: {
        name: body.name,
        photoUrl: body.photoUrl,
        description: body.description,
        sourceLink: body.sourceLink,
        commonUses: body.commonUses,
        allergyPotential: body.allergyPotential,
        skinTypeSummary: body.skinTypeSummary,
        riskBenefit: body.riskBenefit,
        category: body.category,
      },
    });
    
    sendSuccess(res, catalog);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/ingredient-catalog/:id
export async function adminDeleteCatalog(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    
    const existing = await prisma.ingredientCatalog.findUnique({
      where: { id },
      include: { _count: { select: { ingredients: true } } }
    });
    
    if (!existing) throw new AppError('NOT_FOUND', 'Catalog tidak ditemukan', 404);

    // Hapus relasi ke ingredient teknis terlebih dahulu (set catalogId = null)
    // agar tidak error Foreign Key
    await prisma.ingredient.updateMany({
      where: { catalogId: id },
      data: { catalogId: null }
    });

    await prisma.ingredientCatalog.delete({ where: { id } });
    sendSuccess(res, { id, deleted: true });
  } catch (err) {
    next(err);
  }
}