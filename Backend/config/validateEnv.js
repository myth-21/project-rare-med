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



  if (process.env.GOOGLE_CALLBACK_URL?.includes('/api/v1/')) {
    warnings.push('GOOGLE_CALLBACK_URL should be http://localhost:5000/api/auth/google/callback (not /api/v1/)');
  }

  warnings.forEach((w) => log.warn(`[Env] ${w}`));
  errors.forEach((e) => log.error(`[Env] ${e}`));

  return { warnings, errors, ok: errors.length === 0 };
};

export default validateEnv;

