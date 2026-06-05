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
import log from '../utils/logger.js';

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

const clientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const apiPublicUrl = () =>
  (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');

const googleCallbackUrl = () =>
  process.env.GOOGLE_CALLBACK_URL || `${apiPublicUrl()}/api/auth/google/callback`;

const googleFailureCode = (error) => {
  const raw = [
    error?.message,
    error?.oauthError?.data?.toString?.(),
    error?.oauthError?.statusCode,
    error,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (raw.includes('redirect_uri_mismatch')) return 'redirect_uri_mismatch';
  if (raw.includes('invalid_client')) return 'oauth_configuration';
  if (raw.includes('access_denied')) return 'access_denied';
  if (raw.includes('missing_google_code')) return 'missing_google_code';
  return 'google_auth_failed';
};

const redirectGoogleFailure = (res, reason) => {
  const safeReason = encodeURIComponent(typeof reason === 'string' ? reason : googleFailureCode(reason));
  return res.redirect(`${clientUrl()}/login?googleError=${safeReason}`);
};

const ensureGoogleConfigured = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    log.error('[Auth][Google] Google OAuth is not configured');
    return res.redirect(`${clientUrl()}/login?googleError=not_configured`);
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
router.get('/google', ensureGoogleConfigured, (req, res, next) => {
  log.info(`[Auth][Google] Sign-in request received callbackUrl=${googleCallbackUrl()}`);
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account',
  })(req, res, next);
});

router.get('/google/callback', ensureGoogleConfigured, (req, res, next) => {
  log.info(
    `[Auth][Google] Callback received hasCode=${Boolean(req.query.code)} error=${req.query.error || 'none'} callbackUrl=${googleCallbackUrl()}`
  );

  if (req.query.error) {
    log.error(`[Auth][Google] Provider returned error=${req.query.error} description=${req.query.error_description || 'none'}`);
    return redirectGoogleFailure(res, req.query.error);
  }

  if (!req.query.code) {
    log.error('[Auth][Google] Callback missing authorization code');
    return redirectGoogleFailure(res, 'missing_google_code');
  }

  passport.authenticate('google', { session: false }, (error, user, info) => {
    if (error) {
      log.error(`[Auth][Google] Passport callback error message=${error.message}`);
      return redirectGoogleFailure(res, error);
    }

    if (!user) {
      const reason = info?.message || 'google_auth_failed';
      log.error(`[Auth][Google] Passport callback failed reason=${reason}`);
      return redirectGoogleFailure(res, reason);
    }

    log.info(`[Auth][Google] Passport callback success email=${user.email} userId=${user._id || user.id}`);
    req.user = user;
    return googleCallback(req, res, next);
  })(req, res, next);
});

// Saved Medicines Routes
router.post('/saved-medicines/:id', requireAuth, saveMedicine);
router.delete('/saved-medicines/:id', requireAuth, unsaveMedicine);
router.get('/saved-medicines', requireAuth, getSavedMedicines);
router.post('/search-history', requireAuth, addSearchHistory);

// Profile Picture Upload
router.post('/upload-avatar', requireAuth, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', requireAuth, removeAvatar);

export default router;
