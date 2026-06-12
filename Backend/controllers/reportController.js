import asyncHandler from 'express-async-handler';
import Report from '../models/Report.js';

// GET /api/reports - List reports with filtering
export const listReports = asyncHandler(async (req, res) => {
  const { medicineId, pharmacyId, sort = '-createdAt' } = req.query;

  let query = { status: 'approved' }; // Only show approved reports publicly

  if (medicineId) {
    query.medicineId = medicineId;
  }

  if (pharmacyId) {
    query.pharmacyId = pharmacyId;
  }

  const reports = await Report.find(query)
    .populate('medicineId', 'name genericName')
    .populate('pharmacyId', 'name city')
    .populate('userId', 'name email')
    .sort(sort === '-createdAt' ? { createdAt: -1 } : { upvotes: -1 })
    .limit(100);

  res.json(reports);
});

// POST /api/reports - Create report (authenticated users only)
export const createReport = asyncHandler(async (req, res) => {
  const { medicineId, pharmacyId, status, notes } = req.body;

  if (!medicineId || !pharmacyId || !status) {
    return res.status(400).json({ message: 'Medicine ID, pharmacy ID, and status are required' });
  }

  const report = await Report.create({
    medicineId,
    pharmacyId,
    userId: req.user._id,
    status,
    notes: notes || '',
    upvotes: 0,
  });

  res.status(201).json(report);
});

// PATCH /api/reports/:id/upvote - Upvote report
export const upvoteReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { $inc: { upvotes: 1 } },
    { new: true }
  );

  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  res.json({ message: 'Report upvoted', upvotes: report.upvotes });
});

// PATCH /api/reports/:id/approve - Approve report (admin only)
export const approveReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: 'approved' },
    { new: true }
  );

  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  res.json({ message: 'Report approved', report });
});

// PATCH /api/reports/:id/reject - Reject report (admin only)
export const rejectReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true }
  );

  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  res.json({ message: 'Report rejected', report });
});

// PUT /api/reports/:id - Update report (admin only)
export const updateReport = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, notes },
    { new: true, runValidators: true }
  );

  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  res.json(report);
});

// DELETE /api/reports/:id - Delete report (admin only)
export const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndDelete(req.params.id);

  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  res.json({ message: 'Report deleted successfully' });
});
