import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(2).max(255),
  logoUrl: z.string().url().max(500).optional(),
  country: z.string().max(100).optional(),
  website: z.string().url().max(500).optional(),
  reputation: z.string().optional(),
});

export const updateBrandSchema = createBrandSchema.partial();

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;