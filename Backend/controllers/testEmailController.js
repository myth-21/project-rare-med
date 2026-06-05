import { sendWelcomeEmail } from '../services/emailService.js';

export const testWelcomeEmail = async (req, res, next) => {
  try {
    const email = req.query.email || process.env.SMTP_USER;
    await sendWelcomeEmail(email, 'Rare Med Test User');

    res.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Email Error:', error.message);
    next(error);
  }
};
