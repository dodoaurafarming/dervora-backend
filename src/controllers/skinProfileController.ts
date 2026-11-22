import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { getOrCreateUser } from '../middlewares/auth.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';
import type { FirebaseUserData } from '../types/express.js';

function getFirebaseUser(req: Request): FirebaseUserData {
  if (!req.user || !('uid' in req.user)) {
    throw new AppError('UNAUTHORIZED', 'User not authenticated', 401);
  }
  return req.user;
}

// GET /api/skin-profile
export async function getSkinProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const firebaseUser = getFirebaseUser(req);

    const user = await getOrCreateUser(
      firebaseUser.uid,
      firebaseUser.email,
      firebaseUser.name,
      firebaseUser.picture
    );

    const skinProfile = await prisma.skinProfile.findUnique({
      where: { userId: user.id },
    });

    sendSuccess(res, { skinProfile });
  } catch (err) {
    next(err);
  }
}

// POST /api/skin-profile
export async function saveSkinProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const firebaseUser = getFirebaseUser(req);

    const rawAnswers = req.body?.answers;
    if (!rawAnswers || typeof rawAnswers !== 'object' || Array.isArray(rawAnswers)) {
      throw new AppError('VALIDATION_ERROR', 'answers harus berupa objek jawaban kuis', 400);
    }

    const sanitizedAnswers: Record<string, string | string[]> = {};
    for (const [key, val] of Object.entries(rawAnswers as Record<string, unknown>)) {
      if (typeof val === 'string') {
        sanitizedAnswers[key] = val;
      } else if (Array.isArray(val)) {
        sanitizedAnswers[key] = val.filter((item): item is string => typeof item === 'string');
      }
    }

    if (Object.keys(sanitizedAnswers).length === 0) {
      throw new AppError('VALIDATION_ERROR', 'Jawaban kuis tidak boleh kosong', 400);
    }

    const skinType =
      typeof req.body?.skinType === 'string' && req.body.skinType.trim()
        ? req.body.skinType.trim()
        : 'Unknown';

    const concerns: string[] = Array.isArray(req.body?.concerns)
      ? req.body.concerns.filter((item: unknown): item is string => typeof item === 'string')
      : [];

    const user = await getOrCreateUser(
      firebaseUser.uid,
      firebaseUser.email,
      firebaseUser.name,
      firebaseUser.picture
    );

    const skinProfile = await prisma.skinProfile.upsert({
      where: { userId: user.id },
      update: {
        skinType,
        concerns,
        answers: sanitizedAnswers,
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        skinType,
        concerns,
        answers: sanitizedAnswers,
      },
    });

    sendSuccess(res, { skinProfile });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/skin-profile
export async function deleteSkinProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const firebaseUser = getFirebaseUser(req);

    const user = await getOrCreateUser(
      firebaseUser.uid,
      firebaseUser.email,
      firebaseUser.name,
      firebaseUser.picture
    );

    await prisma.skinProfile.deleteMany({
      where: { userId: user.id },
    });

    sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}