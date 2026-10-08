import type { Response } from 'express';
import type { ApiSuccess, ApiError, ApiMeta } from '../types/api.js';

export function sendSuccess<T>(
  res: Response,
  data: T,
  meta: ApiMeta | null = null,
  statusCode: number = 200
): void {
  const response: ApiSuccess<T> = { success: true, data, meta };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details: unknown | null = null
): void {
  const response: ApiError = {
    success: false,
    error: { code, message, details },
  };
  res.status(statusCode).json(response);
}