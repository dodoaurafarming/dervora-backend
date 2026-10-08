import { Router } from 'express';
import * as ctrl from '../controllers/ingredientController.js';

const router = Router();

router.get('/', ctrl.listIngredients);
router.get('/:id', ctrl.getIngredient);

export default router;