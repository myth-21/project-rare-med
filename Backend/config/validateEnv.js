import log from '../utils/logger.js';

export const validateEnv = () => {
  const warnings = [];
  const errors = [];

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    warnings.push('JWT_SECRET is missing or weak — set a long random secret in .env');
  }

  if (!process.env.MONGO_URI) {
    warnings.push('MONGO_URI not set — will try mongodb://127.0.0.1:27017/raremed');
  }



  const smtpKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingSmtpKeys = smtpKeys.filter((key) => !process.env[key]);
  if (missingSmtpKeys.length > 0) {
    warnings.push(`SMTP email is not fully configured - missing ${missingSmtpKeys.join(', ')}`);
  }

  if (process.env.GOOGLE_CALLBACK_URL?.includes('/api/v1/')) {
    warnings.push('GOOGLE_CALLBACK_URL should be http://localhost:5000/api/auth/google/callback (not /api/v1/)');
  }

  if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_SECRET) {
    warnings.push('GOOGLE_CLIENT_SECRET is missing - Google sign-in will be disabled');
  }

  if (!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    warnings.push('GOOGLE_CLIENT_ID is missing - Google sign-in will be disabled');
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL ||
      `${process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`}/api/auth/google/callback`;
    warnings.push(`Google OAuth callback must be configured in Google Cloud as: ${callbackUrl}`);
  }

  warnings.forEach((w) => log.warn(`[Env] ${w}`));
  errors.forEach((e) => log.error(`[Env] ${e}`));

  return { warnings, errors, ok: errors.length === 0 };
};

export default validateEnv;
