import crypto from 'crypto';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { toPublicUrl } from '../utils/publicUrl.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import log from '../utils/logger.js';

// Configure Cloudinary if credentials exist
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  profilePicture: toPublicUrl(user.profilePicture || ''),
  phoneNumber: user.phoneNumber || '',
  city: user.city || '',
  state: user.state || '',
  googleId: user.googleId || null,
  savedMedicines: user.savedMedicines || [],
  searchHistory: user.searchHistory || [],
  isAdmin: Boolean(user.isAdmin),
  isActive: user.isActive,
  notificationPreferences: user.notificationPreferences,
  createdAt: user.createdAt,
});

const authPayload = (user) => ({ token: generateToken(user), user: publicUser(user) });

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const duplicateField = (error) => Object.keys(error.keyPattern || error.keyValue || {})[0] || 'unknown';

const duplicateMessage = (field) => {
  if (field === 'email') return 'Email already registered';
  if (field === 'googleId') return 'Google account is already linked to another user';
  return `Duplicate value for ${field}`;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phoneNumber, city, state } = req.body;
    const normalizedEmail = normalizeEmail(email);
    log.info(`[Auth][Register] Registration request received email=${normalizedEmail || '(missing)'}`);
    
    if (!name || !normalizedEmail || !password) {
      log.warn(`[Auth][Register] Validation failed missingRequired email=${normalizedEmail || '(missing)'}`);
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Name Validation: 3–30 characters, Letters and spaces only, No numbers, No special characters
    const nameRegex = /^[a-zA-Z\s]{3,30}$/;
    if (!nameRegex.test(name.trim())) {
      log.warn(`[Auth][Register] Validation failed invalidName email=${normalizedEmail}`);
      return res.status(400).json({
        message: 'Name must be 3–30 characters and contain letters and spaces only (no numbers or special characters).'
      });
    }

    // Email Validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      log.warn(`[Auth][Register] Validation failed invalidEmail email=${normalizedEmail}`);
      return res.status(400).json({ message: 'Enter a valid email address' });
    }

    // Password Validation: 8–32 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\[\]{}|\\;:\'",.<>\/?~`-]).{8,32}$/;
    if (!passwordRegex.test(password)) {
      log.warn(`[Auth][Register] Validation failed weakPassword email=${normalizedEmail}`);
      return res.status(400).json({
        message: 'Password must be 8–32 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    if (password !== confirmPassword) {
      log.warn(`[Auth][Register] Validation failed passwordMismatch email=${normalizedEmail}`);
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    log.info(
      `[Auth][Register] Email lookup result email=${normalizedEmail} db=${User.db.name} collection=${User.collection.name} found=${Boolean(existing)} userId=${existing?._id || 'none'} hasPassword=${Boolean(existing?.password)} googleLinked=${Boolean(existing?.googleId)}`
    );
    if (existing) {
      if (existing.googleId && !existing.password) {
        existing.name = existing.name || name;
        existing.password = password;
        existing.phoneNumber = existing.phoneNumber || phoneNumber || '';
        existing.city = existing.city || city || '';
        existing.state = existing.state || state || '';
        existing.isActive = true;
        await existing.save();
        log.info(`[Auth][Register] Password credential linked to existing Google user email=${normalizedEmail} userId=${existing._id}`);
        return res.status(200).json({
          message: 'Password login enabled for your existing Rare Med account.',
          ...authPayload(existing),
        });
      }
      log.warn(`[Auth][Register] Duplicate email rejected email=${normalizedEmail} userId=${existing._id}`);
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phoneNumber,
      city,
      state,
      isActive: true,
    });
    log.info(`[Auth][Register] User creation result success email=${normalizedEmail} userId=${user._id} db=${User.db.name} collection=${User.collection.name}`);

    try {
      await sendWelcomeEmail(user.email, user.name);
      user.welcomeEmailSentAt = new Date();
      await user.save({ validateBeforeSave: false });
    } catch (error) {
      console.error('Email Error:', error.message);
    }

    res.status(201).json({
      message: 'Registration successful. You can now log in to your account.',
      ...authPayload(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = duplicateField(error);
      log.error(`[Auth][Register] Duplicate key error field=${field} keyValue=${JSON.stringify(error.keyValue || {})}`);
      return res.status(409).json({ message: duplicateMessage(field) });
    }
    log.error(`[Auth][Register] Registration failed message=${error.message}`);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    log.info(`[Auth][Login] Login request received email=${normalizedEmail || '(missing)'}`);

    if (!normalizedEmail || !password) {
      log.warn(`[Auth][Login] Validation failed missingCredentials email=${normalizedEmail || '(missing)'}`);
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    log.info(
      `[Auth][Login] Login lookup result email=${normalizedEmail} db=${User.db.name} collection=${User.collection.name} found=${Boolean(user)} userId=${user?._id || 'none'} hasPassword=${Boolean(user?.password)} googleLinked=${Boolean(user?.googleId)}`
    );
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const passwordMatches = await user.matchPassword(password);
    log.info(`[Auth][Login] Password comparison result email=${normalizedEmail} userId=${user._id} matches=${passwordMatches}`);
    if (!passwordMatches) {
      const message = user.googleId && !user.password ? 'Use Google sign-in or register a password for this account' : 'Invalid credentials';
      return res.status(401).json({ message });
    }

    if (!user.isActive) return res.status(403).json({ message: 'Account is disabled' });
    log.info(`[Auth][Login] Login success email=${normalizedEmail} userId=${user._id}`);
    res.json(authPayload(user));
  } catch (error) {
    log.error(`[Auth][Login] Login failed message=${error.message}`);
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    if (req.user.isAdmin) return res.json({ user: publicUser(req.user) });
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'savedMedicines',
        populate: { path: 'pharmacies', select: 'name address city state phone location rating openHours isVerified' },
      });
    res.json({ user: publicUser(user || req.user) });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    if (req.user.isAdmin) return res.json({ user: publicUser(req.user) });
    const fields = ['name', 'phoneNumber', 'city', 'state', 'profilePicture', 'notificationPreferences'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    if (req.user.isAdmin) return res.status(400).json({ message: 'Admin password is managed in .env' });
    const { currentPassword, newPassword } = req.body;
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\[\]{}|\\;:'",.<>/?~`-]).{8,32}$/.test(newPassword || '')) {
      return res.status(400).json({ message: 'New password must be 8-32 characters with uppercase, lowercase, number, and special character.' });
    }
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    if (!normalizedEmail) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // SMTP/email sending disabled.
    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\[\]{}|\\;:'",.<>/?~`-]).{8,32}$/.test(password)) {
      return res.status(400).json({ message: 'Password must be 8-32 characters with uppercase, lowercase, number, and special character.' });
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
    user.password = password;
    user.resetPasswordToken = '';
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

export const googleCallback = (req, res) => {
  const redirectUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const token = encodeURIComponent(req.user.token);
  const mode = req.user.isNewUser ? 'signup' : 'signin';
  res.redirect(`${redirectUrl}/google-success?token=${token}&mode=${mode}`);
};

export const saveMedicine = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const medicineId = req.params.id;
    if (!user.savedMedicines.some((id) => String(id) === String(medicineId))) {
      user.savedMedicines.push(medicineId);
      await user.save();
    }
    
    res.json({ message: 'Medicine saved successfully', user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

export const unsaveMedicine = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const medicineId = req.params.id;
    user.savedMedicines = user.savedMedicines.filter(id => String(id) !== String(medicineId));
    await user.save();
    
    res.json({ message: 'Medicine unsaved successfully', user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

export const getSavedMedicines = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedMedicines',
      populate: { path: 'pharmacies', select: 'name city rating coordinates location' }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ savedMedicines: user.savedMedicines || [] });
  } catch (error) {
    next(error);
  }
};

export const addSearchHistory = async (req, res, next) => {
  try {
    const term = String(req.body.term || '').trim();
    if (!term) return res.status(400).json({ message: 'Search term is required' });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.searchHistory = [
      { term },
      ...(user.searchHistory || []).filter((item) => item.term.toLowerCase() !== term.toLowerCase()),
    ].slice(0, 20);
    await user.save();
    res.json({ searchHistory: user.searchHistory, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image to upload.' });
    }

    let profilePictureUrl = `/uploads/${req.file.filename}`;

    // If Cloudinary is configured, upload local file to Cloudinary and delete the local file
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'raremed_avatars',
        });
        profilePictureUrl = uploadResult.secure_url;
        
        // Remove local file
        fs.unlinkSync(req.file.path);
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        // Fallback: keep the local file and serve it locally
      }
    }

    // Save to user profile
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.profilePicture = profilePictureUrl;
    await user.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: toPublicUrl(profilePictureUrl),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const removeAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.profilePicture = '';
    await user.save();
    res.json({ message: 'Profile picture removed', user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};
