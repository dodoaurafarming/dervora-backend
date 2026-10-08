import { Router } from 'express';
import * as ctrl from '../controllers/categoryController.js';

const router = Router();

router.get('/', ctrl.listCategories);
router.get('/:id', ctrl.getCategory);

export default router;