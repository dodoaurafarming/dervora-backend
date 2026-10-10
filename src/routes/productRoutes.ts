import { Router } from 'express';
import * as ctrl from '../controllers/productController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js';

const router = Router();

// Public routes (read-only)
router.get('/', ctrl.listProducts);
router.get('/:id', ctrl.getProduct);

// Protected routes (need admin auth)
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductSchema),
  ctrl.createProduct
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateProductSchema),
  ctrl.updateProduct
);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteProduct);

export default router;