import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import Pharmacy from '../models/Pharmacy.js';
import Report from '../models/Report.js';
import Alert from '../models/Alert.js';
import log from '../utils/logger.js';

// POST /api/admin/login - Admin login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ message: 'Admin credentials not configured' });
  }

  if (email.toLowerCase() !== adminEmail || password !== adminPassword) {
    log.warn(`[Admin] Failed login attempt for ${email}`);
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    {
      email: adminEmail,
      isAdmin: true,
      type: 'admin',
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  log.info(`[Admin] Successful login for ${email}`);

  res.json({
    token,
    user: {
      email: adminEmail,
      name: 'Rare Med Admin',
      isAdmin: true,
    },
  });
});

// GET /api/admin/dashboard - Admin dashboard data
export const adminDashboard = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalMedicines = await Medicine.countDocuments();
  const totalPharmacies = await Pharmacy.countDocuments();
  const totalReports = await Report.countDocuments();
  const pendingReports = await Report.countDocuments({ status: 'pending' });
  const activeAlerts = await Alert.countDocuments({ isActive: true });

  res.json({
    stats: {
      totalUsers,
      totalMedicines,
      totalPharmacies,
      totalReports,
      pendingReports,
      activeAlerts,
    },
  });
});

// GET /api/admin/stats - Detailed admin statistics
export const adminStats = asyncHandler(async (req, res) => {
  const usersPerDay = await User.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  const reportsPerDay = await Report.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  res.json({
    usersPerDay,
    reportsPerDay,
  });
});

// GET /api/admin/analytics - Analytics data
export const analytics = asyncHandler(async (req, res) => {
  const medicinesByCategory = await Medicine.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const pharmaciesByCity = await Pharmacy.aggregate([
    {
      $group: {
        _id: '$city',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const reportStatuses = await Report.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    medicinesByCategory,
    pharmaciesByCity,
    reportStatuses,
  });
});

// GET /api/admin/users - List all users
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, '-password').sort({ createdAt: -1 });
  res.json(users);
});

// PUT /api/admin/users/:id - Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { isAdmin, isActive } = req.body;
  const updateData = {};

  if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
  if (isActive !== undefined) updateData.isActive = isActive;

  const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

// DELETE /api/admin/users/:id - Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ message: 'User deleted successfully' });
});
