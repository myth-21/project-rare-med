import asyncHandler from 'express-async-handler';
import log from '../utils/logger.js';

// GET /api/test-email - Test email endpoint (disabled for security)
export const testWelcomeEmail = asyncHandler(async (req, res) => {
  log.warn('[Email] Test email endpoint called');
  res.json({
    message: 'Test email functionality disabled',
    note: 'Email sending is not configured in this build',
  });
});
