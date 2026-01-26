import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import Organization from '../models/Organization.js';

/**
 * Create reusable transporter object using SMTP
 */
const createTransporter = () => {
  // If SMTP is not configured, return null (email sending will be skipped)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('SMTP not configured. Email sending will be skipped.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  const transporter = createTransporter();

  if (!transporter) {
    logger.warn(`Password reset email would be sent to ${email} with token: ${resetToken}`);
    logger.warn('SMTP not configured. Please configure SMTP settings in .env file.');
    logger.warn(`Reset URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`);
    return; // Return successfully - email is logged instead
  }

  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Multi-Tenant SaaS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your account.</p>
          <p>Please click the following link to reset your password:</p>
          <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>Or copy and paste this URL into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you did not request this password reset, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error(`Error sending password reset email: ${error.message}`);
    throw new Error('Email could not be sent');
  }
};

/**
 * Send invitation email
 * @param {string} email - Recipient email
 * @param {string} invitationToken - Invitation token
 * @param {string} organizationId - Organization ID
 */
export const sendInvitationEmail = async (email, invitationToken, organizationId) => {
  const transporter = createTransporter();

  if (!transporter) {
    const acceptUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation/${invitationToken}`;
    logger.warn(`Invitation email would be sent to ${email} with token: ${invitationToken}`);
    logger.warn('SMTP not configured. Please configure SMTP settings in .env file.');
    logger.warn(`Accept URL: ${acceptUrl}`);
    return; // Return successfully - email is logged instead
  }

  try {
    // Get organization name for email
    const organization = await Organization.findById(organizationId);
    const orgName = organization ? organization.name : 'the organization';

    const acceptUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation/${invitationToken}`;

    const mailOptions = {
      from: `"Multi-Tenant SaaS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Invitation to join ${orgName}`,
      text: `You have been invited to join ${orgName}.\n\nPlease click the following link to accept the invitation:\n\n${acceptUrl}\n\nThis invitation will expire in 7 days.\n\nIf you did not expect this invitation, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited!</h2>
          <p>You have been invited to join <strong>${orgName}</strong>.</p>
          <p>Please click the following link to accept the invitation:</p>
          <p><a href="${acceptUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Accept Invitation</a></p>
          <p>Or copy and paste this URL into your browser:</p>
          <p style="word-break: break-all;">${acceptUrl}</p>
          <p><strong>This invitation will expire in 7 days.</strong></p>
          <p>If you did not expect this invitation, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Invitation email sent to ${email}`);
  } catch (error) {
    logger.error(`Error sending invitation email: ${error.message}`);
    throw new Error('Email could not be sent');
  }
};
