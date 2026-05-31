import express from 'express';
import { approveReport, createReport, deleteReport, listReports, rejectReport, updateReport, upvoteReport } from '../controllers/reportController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';
import { requireDb } from '../middleware/requireDb.js';

const router = express.Router();

router.get('/', requireDb, listReports);
router.post('/', requireAuth, requireDb, createReport);
router.patch('/:id/upvote', requireAuth, upvoteReport);
router.patch('/:id/approve', requireAuth, requireAdmin, approveReport);
router.patch('/:id/reject', requireAuth, requireAdmin, rejectReport);
router.put('/:id', requireAuth, requireAdmin, updateReport);
router.delete('/:id', requireAuth, requireAdmin, deleteReport);

export default router;
