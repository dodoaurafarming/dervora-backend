import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter').max(100),
  password: z.string().min(8, 'Password minimal 8 karakter').max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;