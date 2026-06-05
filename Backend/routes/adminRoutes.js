import express from 'express';
import { analytics, adminDashboard, adminLogin, adminStats, deleteUser, listUsers, updateUser } from '../controllers/adminController.js';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import { createMedicine, deleteMedicine, listMedicines, updateMedicine } from '../controllers/medicineController.js';
import { createPharmacy, deletePharmacy, listPharmacies, updatePharmacy } from '../controllers/pharmacyController.js';
import { deleteReport, listReports, updateReport } from '../controllers/reportController.js';

const router = express.Router();

router.post('/login', adminLogin);

router.use(adminAuthMiddleware);

router.get('/dashboard', adminDashboard);
router.get('/stats', adminStats);
router.get('/analytics', analytics);
router.get('/users', listUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/medicines', listMedicines);
router.post('/medicines', createMedicine);
router.put('/medicines/:id', updateMedicine);
router.delete('/medicines/:id', deleteMedicine);
router.get('/pharmacies', listPharmacies);
router.post('/pharmacies', createPharmacy);
router.put('/pharmacies/:id', updatePharmacy);
router.delete('/pharmacies/:id', deletePharmacy);
router.get('/reports', listReports);
router.put('/reports/:id', updateReport);
router.delete('/reports/:id', deleteReport);

export default router;
