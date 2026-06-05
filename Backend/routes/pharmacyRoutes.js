import express from 'express';
import {
  createPharmacy,
  deletePharmacy,
  getPharmacy,
  listPharmacies,
  nearbyPharmacies,
  updatePharmacy,
} from '../controllers/pharmacyController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/requireDb.js';

const router = express.Router();

router.get('/', requireDb, listPharmacies);
router.get('/nearby', requireDb, nearbyPharmacies);
router.get('/:id', requireDb, getPharmacy);
router.post('/', requireAuth, requireAdmin, createPharmacy);
router.put('/:id', requireAuth, requireAdmin, updatePharmacy);
router.delete('/:id', requireAuth, requireAdmin, deletePharmacy);

export default router;
