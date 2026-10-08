import type { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details: unknown | null;

  constructor(code: string, message: string, statusCode: number = 500, details: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404);
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  console.error('[UNHANDLED ERROR]', err);
  sendError(res, 'INTERNAL_ERROR', 'Internal server error', 500);
}