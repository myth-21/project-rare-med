import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { createToken, loginUser, registerUser, normalizeEmail } from '../services/authService.js';
import log from '../utils/logger.js';

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  profilePicture: user.profilePicture || null,
  googleId: user.googleId || null,
  isAdmin: user.isAdmin,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, phoneNumber } = req.body;
  const result = await registerUser({ name, email, password, confirmPassword });

  if (phoneNumber && result.user) {
    await User.findByIdAndUpdate(result.user.id, { phoneNumber });
  }

  res.status(201).json({
    token: result.token,
    user: result.user,
    message: 'Account created successfully',
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });
  res.json({ token: result.token, user: result.user, message: 'Login successful' });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture || null,
    googleId: user.googleId || null,
    isAdmin: user.isAdmin,
    isActive: user.isActive,
    createdAt: user.createdAt,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phoneNumber, city, state } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
  if (city !== undefined) updateData.city = city;
  if (state !== undefined) updateData.state = state;
  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture || null,
      googleId: user.googleId || null,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      createdAt: user.createdAt,
      phoneNumber: user.phoneNumber,
      city: user.city,
      state: user.state,
    },
    message: 'Profile updated successfully',
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password changed successfully' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.json({ message: 'If account exists, reset link has been sent' });
  }
  const resetToken = createToken(user._id);
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 3600000);
  await user.save();
  log.info(`[Auth] Password reset requested for ${normalizedEmail}`);
  res.json({ message: 'If account exists, reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  if (!token || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Token and passwords are required' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.resetPasswordToken || user.resetPasswordToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    if (new Date() > user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    user.password = password;
    user.resetPasswordToken = '';
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid reset token' });
  }
});

export const googleCallback = asyncHandler(async (req, res) => {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  if (!req.user) {
    return res.redirect(`${clientUrl}/login?googleError=google_auth_failed`);
  }
  const { token, isNewUser } = req.user;
  const redirectUrl = `${clientUrl}/google-success?token=${encodeURIComponent(token)}&isNewUser=${isNewUser}`;
  res.redirect(redirectUrl);
});

export const saveMedicine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { savedMedicines: id } },
    { new: true }
  );
  res.json({ message: 'Medicine saved successfully', savedCount: user.savedMedicines.length });
});

export const unsaveMedicine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { savedMedicines: id } },
    { new: true }
  );
  res.json({ message: 'Medicine removed from saved', savedCount: user.savedMedicines.length });
});

export const getSavedMedicines = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedMedicines');
  res.json({ medicines: user.savedMedicines || [] });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const profilePictureUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePicture: profilePictureUrl },
    { new: true }
  );
  res.json({ message: 'Avatar uploaded successfully', user: { ...formatUser(user), profilePicture: user.profilePicture } });
});

export const removeAvatar = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePicture: '' },
    { new: true }
  );
  res.json({ message: 'Avatar removed successfully', user: { ...formatUser(user), profilePicture: user.profilePicture } });
});

export const addSearchHistory = asyncHandler(async (req, res) => {
  const { term } = req.body;
  if (!term || !term.trim()) {
    return res.status(400).json({ message: 'Search term is required' });
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  user.searchHistory = user.searchHistory || [];
  user.searchHistory.push({ term: term.trim() });
  if (user.searchHistory.length > 50) {
    user.searchHistory = user.searchHistory.slice(-50);
  }
  await user.save();
  res.json({ message: 'Search history updated' });
});
