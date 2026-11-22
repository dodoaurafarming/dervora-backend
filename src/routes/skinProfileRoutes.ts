import { Router } from 'express';
import * as ctrl from '../controllers/skinProfileController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

// Wajib login (private per user, jangan dipasang publicCatalogCache)
router.use(authenticateUser);

router.get('/', ctrl.getSkinProfile);
router.post('/', ctrl.saveSkinProfile);
router.delete('/', ctrl.deleteSkinProfile);

export default router;