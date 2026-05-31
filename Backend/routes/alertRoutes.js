import express from 'express';
import { createAlert, deleteAlert, listAlerts, updateAlert } from '../controllers/alertController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, listAlerts);
router.post('/', requireAuth, createAlert);
router.put('/:id', requireAuth, updateAlert);
router.delete('/:id', requireAuth, deleteAlert);

export default router;
