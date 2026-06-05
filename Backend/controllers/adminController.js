import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import Pharmacy from '../models/Pharmacy.js';
import Report from '../models/Report.js';
import jwt from 'jsonwebtoken';

const createAdminToken = (email) =>
  jwt.sign(
    {
      email,
      isAdmin: true,
      type: 'admin',
    },
    process.env.JWT_SECRET || 'raremed_dev_secret',
    { expiresIn: '1d' }
  );

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ success: false, message: 'Admin credentials are not configured' });
  }

  const emailMatches = String(email || '').trim().toLowerCase() === adminEmail.trim().toLowerCase();
  const passwordMatches = String(password || '') === adminPassword;

  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

  res.json({
    success: true,
    token: createAdminToken(adminEmail),
    admin: {
      email: adminEmail,
      isAdmin: true,
    },
    user: {
      email: adminEmail,
      name: 'Rare Med Admin',
      isAdmin: true,
    },
  });
};

export const adminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalMedicines, totalReports, pendingReports, totalPharmacies, activePharmacies, reportsByCategory, userGrowth] = await Promise.all([
      User.countDocuments(),
      Medicine.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Pharmacy.countDocuments(),
      Pharmacy.countDocuments({ isVerified: true }),
      Report.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      User.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, users: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    res.json({ totalUsers, totalMedicines, totalReports, pendingReports, totalPharmacies, activePharmacies, reportsByCategory, userGrowth });
  } catch (error) {
    next(error);
  }
};

export const adminDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalMedicines, totalPharmacies, totalReports, users, medicines, reports] = await Promise.all([
      User.countDocuments(),
      Medicine.countDocuments(),
      Pharmacy.countDocuments(),
      Report.countDocuments(),
      User.find({}).select('name email createdAt').sort('-createdAt').limit(3).lean(),
      Medicine.find({}).select('name availability createdAt').sort('-createdAt').limit(3).lean(),
      Report.find({}).select('medicineName status createdAt').sort('-createdAt').limit(3).lean(),
    ]);

    const recentActivity = [
      ...users.map((user) => ({ type: 'user', message: `${user.name || user.email} registered`, createdAt: user.createdAt })),
      ...medicines.map((medicine) => ({ type: 'medicine', message: `${medicine.name} added or updated`, createdAt: medicine.createdAt })),
      ...reports.map((report) => ({ type: 'report', message: `${report.medicineName} report is ${report.status}`, createdAt: report.createdAt })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalMedicines,
        totalPharmacies,
        totalReports,
      },
      recentActivity,
    });
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
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
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
