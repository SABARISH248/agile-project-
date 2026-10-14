const nodemailer = require('nodemailer');
const logger = require('../config/logger');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_USER !== 'mock_user') {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  if (t) {
    try {
      const info = await t.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@tracely.com',
        to,
        subject,
        text,
        html,
      });
      logger.info(`Email successfully dispatched to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      logger.warn(`Failed sending email through SMTP: ${err.message}. Defaulting to console log.`);
    }
  }

  // Fallback dev simulation log
  logger.info(`[SIMULATED EMAIL] To: ${to} | Subject: "${subject}" | Content Preview: ${text ? text.slice(0, 80) : 'HTML Body'}`);
  return { success: true, simulated: true };
};

module.exports = { sendEmail };
