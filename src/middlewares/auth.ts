import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../lib/firebaseAdmin.js';
import { prisma } from '../lib/prisma.js';
import type { FirebaseUserData } from '../types/express.js';

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyIdToken(token);

    // PERBAIKAN DI SINI: Tambahkan 'as FirebaseUserData'
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || '',
      picture: decodedToken.picture || '',
    } as FirebaseUserData;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const getOrCreateUser = async (uid: string, email: string, name?: string, photoUrl?: string) => {
  return await prisma.user.upsert({
    where: { firebaseUid: uid },
    update: {
      email,
      name: name || undefined,
      photoUrl: photoUrl || undefined,
    },
    create: {
      firebaseUid: uid,
      email,
      name: name || 'User',
      photoUrl: photoUrl || null,
    },
  });
};