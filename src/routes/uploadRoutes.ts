import { Router } from 'express';
import * as ctrl from '../controllers/uploadController.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.post(
  '/upload',
  authenticate,
  requireAdmin,
  upload.single('image'),
  ctrl.uploadProductImage
);

export default router;