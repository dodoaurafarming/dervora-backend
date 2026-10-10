import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JWTPayload } from '../lib/auth.js';
import { sendError } from '../utils/response.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

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
  if (!req.user || req.user.role !== 'admin') {
    sendError(res, 'FORBIDDEN', 'Admin access required', 403);
    return;
  }
  next();
}