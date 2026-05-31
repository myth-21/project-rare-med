import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import Pharmacy from '../models/Pharmacy.js';
import Report from '../models/Report.js';

export const adminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalMedicines, pendingReports, activePharmacies, reportsByCategory, userGrowth] = await Promise.all([
      User.countDocuments(),
      Medicine.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Pharmacy.countDocuments({ isVerified: true }),
      Report.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      User.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, users: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    res.json({ totalUsers, totalMedicines, pendingReports, activePharmacies, reportsByCategory, userGrowth });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

export const analytics = async (req, res, next) => {
  try {
    const [reportsOverTime, topMedicines, cityCoverage, userGrowth] = await Promise.all([
      Report.aggregate([{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, reports: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Report.aggregate([{ $group: { _id: '$medicineName', reports: { $sum: 1 } } }, { $sort: { reports: -1 } }, { $limit: 8 }]),
      Pharmacy.aggregate([{ $group: { _id: '$city', pharmacies: { $sum: 1 } } }, { $sort: { pharmacies: -1 } }]),
      User.aggregate([{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, users: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ]);
    res.json({ reportsOverTime, topMedicines, cityCoverage, userGrowth });
  } catch (error) {
    next(error);
  }
};
