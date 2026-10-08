import { Router } from 'express';
import * as ctrl from '../controllers/productController.js';
import { validate } from '../middlewares/validate.js';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js';

const router = Router();

router.get('/', ctrl.listProducts);
router.get('/:id', ctrl.getProduct);
router.post('/', validate(createProductSchema), ctrl.createProduct);
router.put('/:id', validate(updateProductSchema), ctrl.updateProduct);
router.delete('/:id', ctrl.deleteProduct);

export default router;