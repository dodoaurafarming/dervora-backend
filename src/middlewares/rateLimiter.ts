import rateLimit from 'express-rate-limit';

/**
 * Rate limiter untuk login endpoint.
 * Max 5 attempts per 15 minutes per IP.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5,                    // 5 attempts
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
      details: null,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});