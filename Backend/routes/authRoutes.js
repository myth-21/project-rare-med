import express from 'express';
import passport from 'passport';
import multer from 'multer';
import fs from 'fs';
import {
  changePassword,
  forgotPassword,
  getProfile,
  googleCallback,
  login,
  register,
  resetPassword,
  updateProfile,
  saveMedicine,
  unsaveMedicine,
  getSavedMedicines,
  uploadAvatar,
  removeAvatar,
  addSearchHistory,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

// Ensure public/uploads directory exists for avatar uploads
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `avatar-${req.user._id}-${uniqueSuffix}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

const router = express.Router();

const ensureGoogleConfigured = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?googleError=not_configured`);
  }
  next();
};

router.post('/register', register);
router.post('/login', login);
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);
router.post('/change-password', requireAuth, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/google', ensureGoogleConfigured, passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login` }), googleCallback);

// Saved Medicines Routes
router.post('/saved-medicines/:id', requireAuth, saveMedicine);
router.delete('/saved-medicines/:id', requireAuth, unsaveMedicine);
router.get('/saved-medicines', requireAuth, getSavedMedicines);
router.post('/search-history', requireAuth, addSearchHistory);

// Profile Picture Upload
router.post('/upload-avatar', requireAuth, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', requireAuth, removeAvatar);

export default router;
