import type { Request, Response, NextFunction } from 'express';
import { verifyPassword, generateToken } from '../lib/auth.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';
import type { LoginInput } from '../schemas/auth.schema.js';

/**
 * POST /api/auth/login
 * Verify credentials, return JWT token.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body as LoginInput;

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminUsername || !adminPasswordHash) {
      throw new AppError('INTERNAL_ERROR', 'Admin credentials not configured', 500);
    }

    // Verify username
    if (username !== adminUsername) {
      throw new AppError('INVALID_CREDENTIALS', 'Username atau password salah', 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, adminPasswordHash);
    if (!isValid) {
      throw new AppError('INVALID_CREDENTIALS', 'Username atau password salah', 401);
    }

    // Generate token
    const token = generateToken({
      userId: 'admin',
      username: adminUsername,
      role: 'admin',
    });

    sendSuccess(res, {
      token,
      user: {
        username: adminUsername,
        role: 'admin',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Return current user info (requires auth).
 */
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
    }

    sendSuccess(res, {
      username: req.user.username,
      role: req.user.role,
    });
  } catch (err) {
    next(err);
  }
}