import { AppError } from '../middlewares/errorHandler.js';

/**
 * Parse `req.params.id` (yang bertipe `string | string[]`) menjadi number.
 * Throw AppError kalau bukan angka valid.
 */
export function parseId(raw: string | string[] | undefined): number {
  const idStr = Array.isArray(raw) ? raw[0] : raw;
  if (!idStr) {
    throw new AppError('VALIDATION_ERROR', 'ID parameter is required', 400);
  }
  const id = parseInt(idStr, 10);
  if (isNaN(id) || id <= 0) {
    throw new AppError('VALIDATION_ERROR', 'ID must be a positive integer', 400);
  }
  return id;
}