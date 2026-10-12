import { Router } from 'express';
import * as ctrl from '../controllers/adminIngredientController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';
import {
  createIngredientSchema,
  updateIngredientSchema,
} from '../schemas/ingredient.schema.js';

const router = Router();

// Semua route butuh auth + admin
router.use(authenticate, requireAdmin);

router.get('/', ctrl.adminListIngredients);
router.get('/:id', ctrl.adminGetIngredient);
router.post('/', validate(createIngredientSchema), ctrl.adminCreateIngredient);
router.put('/:id', validate(updateIngredientSchema), ctrl.adminUpdateIngredient);
router.delete('/:id', ctrl.adminDeleteIngredient);

export default router;