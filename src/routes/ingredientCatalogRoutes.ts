import { Router } from 'express';
import { listCatalog, getCatalogDetail } from '../controllers/ingredientCatalogController.js';

const router = Router();

router.get('/', listCatalog);
router.get('/:id', getCatalogDetail);

export default router;