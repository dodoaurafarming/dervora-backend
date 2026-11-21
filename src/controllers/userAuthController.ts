import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyIdToken } from '../lib/firebaseAdmin.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * POST /api/auth/user-login
 * Menerima token Firebase dari frontend, verifikasi, dan simpan user ke DB.
 */
export async function loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // 1. Verifikasi token dengan Firebase Admin
    const decodedToken = await verifyIdToken(token);

    // 2. Simpan atau update user di database (Upsert)
    const user = await prisma.user.upsert({
      where: { firebaseUid: decodedToken.uid },
      update: {
        email: decodedToken.email || '',
        name: decodedToken.name || undefined,
        photoUrl: decodedToken.picture || undefined,
      },
      create: {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || 'User',
        photoUrl: decodedToken.picture || null,
      },
    });

    // 3. Kembalikan data user ke frontend
    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
    });
  } catch (err) {
    next(err);
  }
}