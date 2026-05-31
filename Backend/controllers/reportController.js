import Report from '../models/Report.js';
import Medicine from '../models/Medicine.js';

export const listReports = async (req, res, next) => {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    const reports = await Report.find(query)
      .populate('reportedBy', 'name email')
      .populate('medicine', 'name category')
      .populate('pharmacy', 'name city')
      .sort('-createdAt')
      .lean();
    const formatted = reports.map((r) => ({
      ...r,
      submittedBy: r.reportedBy,
    }));
    res.json({ reports: formatted });
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req, res, next) => {
  try {
    const payload = {
      medicine: req.body.medicine || undefined,
      pharmacy: req.body.pharmacy || undefined,
      medicineName: req.body.medicineName || req.body.medicine || '',
      pharmacyName: req.body.pharmacyName || '',
      location: req.body.location || req.body.city || 'Location not specified',
      notes: req.body.notes || req.body.description || '',
      description: req.body.description || req.body.notes || '',
      availabilityStatus: req.body.availabilityStatus || req.body.reportedAvailability || 'available',
      severity: req.body.severity || 'medium',
      status: 'pending',
      submittedAt: new Date(),
      reportedBy: req.user._id,
    };
    if (!payload.medicineName && payload.medicine) {
      const medicine = await Medicine.findById(payload.medicine).select('name');
      payload.medicineName = medicine?.name || 'Medicine report';
    }
    if (!payload.medicineName) return res.status(400).json({ message: 'Medicine is required' });
    const report = await Report.create(payload);
    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (['approved', 'verified', 'resolved', 'rejected'].includes(update.status)) {
      update.reviewedAt = new Date();
      update.reviewedBy = req.user._id;
    }
    const report = await Report.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (['approved', 'verified', 'resolved'].includes(report.status) && report.medicine) {
      const medicine = await Medicine.findById(report.medicine);
      if (medicine) {
        medicine.availability = report.availabilityStatus || 'available';
        if (report.pharmacy && !medicine.pharmacies.some((id) => String(id) === String(report.pharmacy))) {
          medicine.pharmacies.push(report.pharmacy);
        }
        await medicine.save();
      }
    }
    res.json({ report });
  } catch (error) {
    next(error);
  }
};

export const approveReport = async (req, res, next) => {
  req.body = { ...req.body, status: 'approved' };
  return updateReport(req, res, next);
};

export const rejectReport = async (req, res, next) => {
  req.body = { ...req.body, status: 'rejected' };
  return updateReport(req, res, next);
};

export const upvoteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    const voted = report.upvotes.some((id) => id.equals(req.user._id));
    report.upvotes = voted ? report.upvotes.filter((id) => !id.equals(req.user._id)) : [...report.upvotes, req.user._id];
    await report.save();
    res.json({ report });
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted' });
  } catch (error) {
    next(error);
  }
};
