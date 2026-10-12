import type { Request, Response, NextFunction } from 'express';
import { uploadImage } from '../lib/cloudinary.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * POST /api/admin/upload
 * Upload single image to Cloudinary.
 * Body: multipart/form-data dengan field "image"
 */
export async function uploadProductImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError('VALIDATION_ERROR', 'No file uploaded. Use field name "image".', 400);
    }

    const { url, publicId } = await uploadImage(req.file.buffer);

    sendSuccess(res, {
      url,
      publicId,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/upload/ingredient
 * Upload single ingredient image to Cloudinary.
 */
export async function uploadIngredientImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError('VALIDATION_ERROR', 'No file uploaded. Use field name "image".', 400);
    }

    const { url, publicId } = await uploadImage(req.file.buffer, 'dervora/ingredients');

    sendSuccess(res, {
      url,
      publicId,
    });
  } catch (err) {
    next(err);
  }
}