import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';
import type { CreateProductInput, UpdateProductInput } from '../schemas/product.schema.js';
import { deleteImage } from '../lib/cloudinary.js';
import { parseId } from '../utils/parseId.js';

// Reusable include untuk product (dengan catalog di ingredient)
const productInclude = {
  brand: true,
  category: true,
  ingredients: {
    include: {
      ingredient: {
        include: {
          catalog: true,    // ← TAMBAHAN: include catalog
        },
      },
    },
  },
} as const;

export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10', 10) || 10));
    const search = (req.query.search as string) || '';
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(search && { name: { contains: search } }),
      ...(categoryId && { categoryId }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: productInclude,    // ← pakai reusable include
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

export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,    // ← pakai reusable include
    });
    if (!product) throw new AppError('NOT_FOUND', 'Product not found', 404);
    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as CreateProductInput;
    const { ingredientIds, ...productData } = body;

    const product = await prisma.product.create({
      data: {
        ...productData,
        ingredients: ingredientIds
          ? {
              create: ingredientIds.map((id) => ({ ingredientId: id })),
            }
          : undefined,
      },
      include: productInclude,    // ← pakai reusable include
    });
    sendSuccess(res, product, null, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const body = req.body as UpdateProductInput;
    const { ingredientIds, ...productData } = body;

    const existing = await prisma.product.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('NOT_FOUND', 'Product not found', 404);

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(ingredientIds && {
          ingredients: {
            deleteMany: {},
            create: ingredientIds.map((ingId) => ({ ingredientId: ingId })),
          },
        }),
      },
      include: productInclude,    // ← pakai reusable include
    });
    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const existing = await prisma.product.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('NOT_FOUND', 'Product not found', 404);

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Optional: Hapus gambar dari Cloudinary
    if (existing.imagePublicId) {
      try {
        await deleteImage(existing.imagePublicId);
        console.log(`✅ Deleted image from Cloudinary: ${existing.imagePublicId}`);
      } catch (err) {
        console.warn(`⚠️  Failed to delete image from Cloudinary:`, err);
        // Jangan throw — soft delete tetap berhasil
      }
    }

    sendSuccess(res, { id, deleted: true });
  } catch (err) {
    next(err);
  }
}