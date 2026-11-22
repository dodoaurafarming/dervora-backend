import { Router } from 'express';
import * as ctrl from '../controllers/ingredientController.js';
import { publicCatalogCache } from '../middlewares/cacheControl.js';

const router = Router();
router.use(publicCatalogCache(60, 300, 3600));
router.get('/', ctrl.listIngredients);
router.get('/:id', ctrl.getIngredient);

export default router;