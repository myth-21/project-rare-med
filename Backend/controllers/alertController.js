import asyncHandler from 'express-async-handler';
import Alert from '../models/Alert.js';

// GET /api/alerts - List user's alerts
export const listAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ userId: req.user._id })
    .populate('medicineId', 'name genericName')
    .populate('pharmacyId', 'name city')
    .sort({ createdAt: -1 });

  res.json(alerts);
});

// POST /api/alerts - Create alert
export const createAlert = asyncHandler(async (req, res) => {
  const { medicineId, pharmacyId, type } = req.body;

  if (!medicineId || !type) {
    return res.status(400).json({ message: 'Medicine ID and alert type are required' });
  }

  const alert = await Alert.create({
    userId: req.user._id,
    medicineId,
    pharmacyId: pharmacyId || null,
    type, // 'available', 'price_drop', 'restock'
    isActive: true,
  });

  res.status(201).json(alert);
});

// PUT /api/alerts/:id - Update alert
export const updateAlert = asyncHandler(async (req, res) => {
  const { type, isActive } = req.body;

  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { type, isActive },
    { new: true, runValidators: true }
  );

  if (!alert) {
    return res.status(404).json({ message: 'Alert not found' });
  }

  res.json(alert);
});

// DELETE /api/alerts/:id - Delete alert
export const deleteAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndDelete(req.params.id);

  if (!alert) {
    return res.status(404).json({ message: 'Alert not found' });
  }

  res.json({ message: 'Alert deleted successfully' });
});
