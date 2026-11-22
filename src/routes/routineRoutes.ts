import { Router } from 'express';
import * as ctrl from '../controllers/routineController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

// Semua rute di sini WAJIB login (divalidasi oleh middleware authenticateUser)
router.use(authenticateUser);

router.get('/', ctrl.getRoutine);
router.post('/', ctrl.saveRoutine);

// ⚠️ PENTING: Route '/clear' HARUS diletakkan SEBELUM '/:slotId' 
// agar tidak tertangkap sebagai parameter slotId
router.delete('/clear', ctrl.clearAllRoutine); 
router.delete('/:slotId', ctrl.removeRoutine);

export default router;