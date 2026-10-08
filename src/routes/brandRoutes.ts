import { Router } from 'express';
import * as ctrl from '../controllers/brandController.js';
import { validate } from '../middlewares/validate.js';
import { createBrandSchema, updateBrandSchema } from '../schemas/brand.schema.js';

const router = Router();

router.get('/', ctrl.listBrands);
router.get('/:id', ctrl.getBrand);
router.post('/', validate(createBrandSchema), ctrl.createBrand);
router.put('/:id', validate(updateBrandSchema), ctrl.updateBrand);
router.delete('/:id', ctrl.deleteBrand);

export default router;