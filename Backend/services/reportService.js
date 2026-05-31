import Report from '../models/Report.js';
import Pharmacy from '../models/Pharmacy.js';
import Medicine from '../models/Medicine.js';

export const createReport = async ({ userId, medicineId, pharmacyId, quantity, notes }) => {
  const medicine = await Medicine.findById(medicineId);
  const pharmacy = await Pharmacy.findById(pharmacyId);

  if (!medicine || !pharmacy) {
    const error = new Error('Invalid medicine or pharmacy selected');
    error.statusCode = 400;
    throw error;
  }

  const report = await Report.create({
    user: userId,
    medicine: medicineId,
    pharmacy: pharmacyId,
    quantity,
    notes,
  });

  return report;
};

export const getReportsByUser = async (userId) => {
  return Report.find({ user: userId })
    .populate('medicine', 'name brand dosage')
    .populate('pharmacy', 'name address')
    .sort({ createdAt: -1 });
};
