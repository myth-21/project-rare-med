import { getSmtpStatus } from '../services/emailService.js';

export const testWelcomeEmail = async (req, res, next) => {
  // SMTP/email service disabled intentionally.
  // Keep endpoint stable but remove SMTP functionality.
  const smtp = getSmtpStatus();
  return res.status(503).json({
    message: 'Email service is disabled in this deployment (SMTP/Nodemailer removed).',
    smtp,
  });
};

