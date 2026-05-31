import express from 'express';
import { createMedicine, deleteMedicine, getMedicine, listMedicines, suggestMedicines, updateMedicine } from '../controllers/medicineController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/requireDb.js';

const router = express.Router();

router.get('/', requireDb, listMedicines);
router.get('/suggestions', requireDb, suggestMedicines);
router.get('/:id', requireDb, getMedicine);
router.post('/', requireAuth, requireAdmin, createMedicine);
router.put('/:id', requireAuth, requireAdmin, updateMedicine);
router.delete('/:id', requireAuth, requireAdmin, deleteMedicine);

export default router;
