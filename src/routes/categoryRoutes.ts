import { Router } from 'express';
import * as ctrl from '../controllers/categoryController.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';

const router = Router();

// Public routes (read-only)
router.get('/', ctrl.listCategories);
router.get('/:id', ctrl.getCategory);

// Protected routes (admin only)
router.post('/', authenticate, requireAdmin, ctrl.createCategory);

export default router;