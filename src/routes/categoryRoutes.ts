import { Router } from 'express';
import * as ctrl from '../controllers/categoryController.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';
import { publicCatalogCache } from '../middlewares/cacheControl.js';

const router = Router();
router.use(publicCatalogCache(60, 300, 3600));
// Public routes (read-only)
router.get('/', ctrl.listCategories);
router.get('/:id', ctrl.getCategory);

// Protected routes (admin only)
router.post('/', authenticate, requireAdmin, ctrl.createCategory);

export default router;