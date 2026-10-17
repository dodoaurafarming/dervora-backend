import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/ingredient-catalog
export const listCatalog = async (req: Request, res: Response) => {
  try {
    const catalog = await prisma.ingredientCatalog.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: catalog });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/ingredient-catalog/:id
export const getCatalogDetail = async (req: Request, res: Response) => {
  try {
    const catalog = await prisma.ingredientCatalog.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        ingredients: {
          include: {
            productIngredients: {
              include: {
                product: {
                  include: {
                    brand: true,
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!catalog) {
      return res.status(404).json({ success: false, message: 'Katalog tidak ditemukan' });
    }

    // Ekstrak semua produk unik yang terhubung dengan katalog ini
    const products = catalog.ingredients
      .flatMap((ing) => ing.productIngredients)
      .map((pi) => pi.product)
      .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

    res.json({
      success: true,
      data: {
        ...catalog,
        products,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};