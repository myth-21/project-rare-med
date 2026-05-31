// Email service disabled (SMTP/Nodemailer removed).
// Kept exports for backward compatibility with controllers.

export function verifySmtpConnection() {
  return { configured: false };
}

export function getSmtpStatus() {
  return {
    configured: false,
    host: '(SMTP disabled)',
    port: undefined,
    user: undefined,
  };
}

export async function sendWelcomeEmailSafe() {
  return { sent: false, configured: false, reason: 'SMTP disabled' };
}

export async function sendPasswordResetEmail() {
  return { sent: false, configured: false, reason: 'SMTP disabled' };
}

// Used by medicine availability alerts (disabled)
export async function sendMedicineAvailabilityAlert() {
  return { sent: false, configured: false, reason: 'SMTP disabled' };
}

// Deprecated/unused direct send API (kept to avoid import breakage)
export async function sendWelcomeEmail() {
  return { sent: false, configured: false, reason: 'SMTP disabled' };
}


