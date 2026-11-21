import { Router } from 'express';
import * as adminCtrl from '../controllers/authController.js'; // Controller Admin Lama
import * as userCtrl from '../controllers/userAuthController.js'; // Controller User Baru
import { validate } from '../middlewares/validate.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';
import { authenticate } from '../middlewares/authenticate.js';
import { loginSchema } from '../schemas/auth.schema.js';

const router = Router();

// ==========================================
// ROUTES KHUSUS ADMIN (Tetap menggunakan JWT)
// ==========================================
router.post('/login', loginLimiter, validate(loginSchema), adminCtrl.login);
router.get('/me', authenticate, adminCtrl.me);

// ==========================================
// ROUTES KHUSUS USER BIASA (Menggunakan Firebase)
// ==========================================
// Endpoint ini TIDAK pakai middleware 'authenticate' karena dia yang memproses token Firebase
router.post('/user-login', userCtrl.loginUser);

export default router;