import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3).max(255),
  brandId: z.number().int().positive(),
  categoryId: z.number().int().positive().optional(),
  description: z.string().optional(),
  price: z.number().int().positive().optional(),
  imageUrl: z.string().url().max(500).optional(),
  bpom: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
  halal: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  howToUse: z.string().optional(),
  notes: z.string().optional(),
  skinTypes: z.array(z.string()).optional(),
  concerns: z.array(z.string()).optional(),
  ingredientIds: z.array(z.number().int().positive()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;