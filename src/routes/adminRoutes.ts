import { Router } from 'express';
import * as ctrl from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';

const router = Router();

// Semua route admin butuh authentication + admin role
router.use(authenticate, requireAdmin);

// Products
router.get('/products', ctrl.adminListProducts);
router.get('/products/:id', ctrl.adminGetProduct);
router.post('/products/:id/restore', ctrl.adminRestoreProduct);

// Stats
router.get('/stats', ctrl.adminStats);

export default router;