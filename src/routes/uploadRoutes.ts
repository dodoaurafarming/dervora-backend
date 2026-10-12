import { Router } from 'express';
import * as ctrl from '../controllers/uploadController.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// Upload product image
router.post(
  '/upload',
  authenticate,
  requireAdmin,
  upload.single('image'),
  ctrl.uploadProductImage
);

// Upload ingredient image — BARU
router.post(
  '/upload/ingredient',
  authenticate,
  requireAdmin,
  upload.single('image'),
  ctrl.uploadIngredientImage
);

export default router;