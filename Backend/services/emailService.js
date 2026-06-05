import nodemailer from 'nodemailer';

const smtpPort = () => Number(process.env.SMTP_PORT || 587);

const smtpConfig = () => ({
  host: process.env.SMTP_HOST,
  port: smtpPort(),
  secure: smtpPort() === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

const mailFrom = () => process.env.MAIL_FROM || `"Rare Med Team" <${process.env.SMTP_USER}>`;

const createTransporter = () => {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP configuration is incomplete');
  }

  return nodemailer.createTransport(smtpConfig());
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const welcomeEmailHtml = (name) => {
  const safeName = escapeHtml(name || 'Rare Med user');

  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#f4f7f5;font-family:Arial,Helvetica,sans-serif;color:#111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f5;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dbe7de;">
                <tr>
                  <td style="background:#0b1410;padding:28px 32px;">
                    <h1 style="margin:0;color:#22c55e;font-size:28px;letter-spacing:.3px;">Rare Med</h1>
                    <p style="margin:8px 0 0;color:#d1fae5;font-size:14px;">Medicine availability made simple</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Hello ${safeName},</h2>
                    <p style="margin:0 0 14px;line-height:1.6;color:#1f2937;">Welcome to Rare Med.</p>
                    <p style="margin:0 0 22px;line-height:1.6;color:#1f2937;">Your account has been successfully created.</p>
                    <div style="background:#ecfdf5;border-left:4px solid #16a34a;border-radius:10px;padding:18px 20px;margin:0 0 24px;">
                      <p style="margin:0 0 10px;font-weight:700;color:#0b1410;">You can now:</p>
                      <ul style="margin:0;padding-left:20px;color:#1f2937;line-height:1.8;">
                        <li>Search medicines</li>
                        <li>Find nearby pharmacies</li>
                        <li>Track medicine availability</li>
                        <li>Submit medicine reports</li>
                      </ul>
                    </div>
                    <p style="margin:0 0 8px;line-height:1.6;color:#1f2937;">Thank you for choosing Rare Med.</p>
                    <p style="margin:0;color:#111827;font-weight:700;">Rare Med Team</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#0b1410;padding:18px 32px;color:#9ca3af;font-size:12px;">
                    This is an automated healthcare service notification from Rare Med.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export function getSmtpStatus() {
  return {
    configured: isSmtpConfigured(),
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT ? smtpPort() : undefined,
    user: process.env.SMTP_USER || '',
  };
}

export async function verifySmtpConnection() {
  const transporter = createTransporter();
  await transporter.verify();
  return { configured: true };
}

export async function sendWelcomeEmail(email, name) {
  const transporter = createTransporter();

  return transporter.sendMail({
    from: mailFrom(),
    to: email,
    subject: 'Welcome to Rare Med',
    html: welcomeEmailHtml(name),
    text: `Hello ${name || 'Rare Med user'},

Welcome to Rare Med.

Your account has been successfully created.

You can now:
- Search medicines
- Find nearby pharmacies
- Track medicine availability
- Submit medicine reports

Thank you for choosing Rare Med.

Rare Med Team`,
  });
}

export async function sendWelcomeEmailSafe(userOrEmail, name) {
  const email = typeof userOrEmail === 'string' ? userOrEmail : userOrEmail?.email;
  const displayName = name || (typeof userOrEmail === 'object' ? userOrEmail?.name : '');

  try {
    await sendWelcomeEmail(email, displayName);
    return { sent: true, configured: true };
  } catch (error) {
    console.error('Email Error:', error.message);
    return { sent: false, configured: isSmtpConfigured(), error: error.message };
  }
}

export async function sendPasswordResetEmail(email, resetUrl) {
  const transporter = createTransporter();

  return transporter.sendMail({
    from: mailFrom(),
    to: email,
    subject: 'Reset your Rare Med password',
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;">
        <h2 style="color:#16a34a;">Rare Med password reset</h2>
        <p>Use the link below to reset your password.</p>
        <p><a href="${escapeHtml(resetUrl)}">Reset password</a></p>
      </div>
    `,
  });
}

export async function sendMedicineAvailabilityAlert(user, medicine, pharmacy) {
  const transporter = createTransporter();

  return transporter.sendMail({
    from: mailFrom(),
    to: user.email,
    subject: `${medicine.name} availability update`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;">
        <h2 style="color:#16a34a;">Rare Med availability alert</h2>
        <p>${escapeHtml(medicine.name)} is now marked available${pharmacy?.name ? ` at ${escapeHtml(pharmacy.name)}` : ''}.</p>
      </div>
    `,
  });
}
