import { Router } from 'express';
import { listCatalog, getCatalogDetail } from '../controllers/ingredientCatalogController.js';
import { publicCatalogCache } from '../middlewares/cacheControl.js';

const router = Router();
router.use(publicCatalogCache(60, 300, 3600));
router.get('/', listCatalog);
router.get('/:id', getCatalogDetail);

export default router;