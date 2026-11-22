import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * GET /api/routine
 * Mengambil semua item rutinitas user yang sedang login
 */
export async function getRoutine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // req.user.uid berisi firebaseUid dari middleware authenticateUser
    const firebaseUid = (req.user as any).uid; 

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { 
        routines: {
          include: {
            product: true, // Mengambil detail produk agar frontend bisa langsung render
          },
          orderBy: { step: 'asc' }
        } 
      },
    });

    if (!user) {
      throw new AppError('NOT_FOUND', 'User tidak ditemukan', 404);
    }

    sendSuccess(res, { routines: user.routines });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/routine
 * Menyimpan atau memperbarui item rutinitas
 */
export async function saveRoutine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const firebaseUid = (req.user as any).uid;
    const { productId, slotId, timeOfDay, step } = req.body;

    if (!productId || !slotId || !timeOfDay || step === undefined) {
      throw new AppError('BAD_REQUEST', 'Data tidak lengkap (productId, slotId, timeOfDay, step wajib diisi)', 400);
    }

    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) {
      throw new AppError('NOT_FOUND', 'User tidak ditemukan', 404);
    }

    // Upsert: Jika sudah ada di slot & waktu yang sama, update. Jika belum, buat baru.
    const routine = await prisma.routine.upsert({
      where: {
        userId_slotId_timeOfDay: {
          userId: user.id,
          slotId: String(slotId),
          timeOfDay: String(timeOfDay),
        },
      },
      update: {
        productId: Number(productId),
        step: Number(step),
      },
      create: {
        userId: user.id,
        productId: Number(productId),
        slotId: String(slotId),
        timeOfDay: String(timeOfDay),
        step: Number(step),
      },
    });

    // Ambil data lengkap termasuk produk untuk dikembalikan ke frontend
    const fullRoutine = await prisma.routine.findUnique({
      where: { id: routine.id },
      include: { product: true }
    });

    sendSuccess(res, { routine: fullRoutine });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/routine/:slotId
 * Menghapus satu item dari rutinitas berdasarkan slot
 */
export async function removeRoutine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const firebaseUid = (req.user as any).uid;
    const { slotId } = req.params;
    const { timeOfDay } = req.query; 

    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) {
      throw new AppError('NOT_FOUND', 'User tidak ditemukan', 404);
    }

    await prisma.routine.deleteMany({
      where: {
        userId: user.id,
        slotId: String(slotId),
        ...(timeOfDay ? { timeOfDay: String(timeOfDay) } : {}),
      },
    });

    sendSuccess(res, { message: 'Produk berhasil dihapus dari rutinitas' });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/routine/clear
 * Menghapus SEMUA rutinitas user yang sedang login (PERBAIKAN BUG 3 & 4)
 */
export async function clearAllRoutine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const firebaseUid = (req.user as any).uid;

    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) {
      throw new AppError('NOT_FOUND', 'User tidak ditemukan', 404);
    }

    // Hapus semua record routine milik user ini
    await prisma.routine.deleteMany({
      where: {
        userId: user.id,
      },
    });

    sendSuccess(res, { message: 'Semua rutinitas berhasil dihapus dari database' });
  } catch (err) {
    next(err);
  }
}