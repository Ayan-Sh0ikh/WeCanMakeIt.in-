// config/mailer.js
const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 5,
  });
  return transporter;
}

/**
 * sendEmail({ to, subject, html, text?, attachments? })
 */
exports.sendEmail = async ({ to, subject, html, text, attachments }) => {
  const t = getTransporter();
  const info = await t.sendMail({
    from:        process.env.EMAIL_FROM || 'WeCanMakeIt <hello@wecanmakeit.in>',
    to,
    subject,
    html,
    text,
    attachments,
  });
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧  Email sent: ${info.messageId} → ${to}`);
  }
  return info;
};

/* Verify connection on startup */
exports.verifyConnection = async () => {
  try {
    await getTransporter().verify();
    console.log('✅  SMTP connection verified');
  } catch (err) {
    console.warn('⚠️   SMTP connection failed:', err.message);
  }
};
