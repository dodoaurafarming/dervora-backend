import { Router } from 'express';
import * as ctrl from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';
import { authenticate } from '../middlewares/authenticate.js';
import { loginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), ctrl.login);
router.get('/me', authenticate, ctrl.me);

export default router;