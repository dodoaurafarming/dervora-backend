import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JWTPayload } from '../lib/auth.js';
import { sendError } from '../utils/response.js';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'UNAUTHORIZED', 'Missing or invalid authorization header', 401);
    return;
  }

  const token = authHeader.substring(7); // Remove "Bearer "
  const payload = verifyToken(token);

  if (!payload) {
    sendError(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
    return;
  }

  req.user = payload;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  // PERBAIKAN: Type assertion agar TypeScript tahu ini adalah JWTPayload 
  // (karena middleware ini hanya akan dipanggil setelah middleware authenticate berjalan)
  const user = req.user as JWTPayload | undefined;
  
  if (!user || user.role !== 'admin') {
    sendError(res, 'FORBIDDEN', 'Admin access required', 403);
    return;
  }
  next();
}