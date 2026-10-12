import { z } from 'zod';

export const createIngredientSchema = z.object({
  name: z.string().min(2).max(255),
  function: z.string().max(1000).optional(),
  description: z.string().optional(),
  suitableSkin: z.array(z.string()).optional(),
  concerns: z.array(z.string()).optional(),
  photoUrl: z.string().url().max(500).optional(),
  photoPublicId: z.string().max(255).optional(),
  sourceLink: z.string().url().max(500).optional(),
});

export const updateIngredientSchema = createIngredientSchema.partial();

export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;
export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>;