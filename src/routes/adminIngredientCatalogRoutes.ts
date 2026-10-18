import { Router } from 'express';
import { 
  adminListCatalog, 
  adminCreateCatalog, 
  adminUpdateCatalog, 
  adminDeleteCatalog 
} from '../controllers/adminIngredientCatalogController.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';

const router = Router();

// Semua route admin wajib login
router.use(authenticate, requireAdmin);

router.get('/', adminListCatalog);
router.post('/', adminCreateCatalog);
router.put('/:id', adminUpdateCatalog);
router.delete('/:id', adminDeleteCatalog);

// PASTIKAN BARIS INI ADA DI PALING BAWAH
export default router;