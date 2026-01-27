import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import logger from '../utils/logger.js';
import Organization from '../models/Organization.js';

/**
 * Email service with support for Resend API (recommended) and SMTP fallback
 * 
 * NOTE: Render's free tier blocks outbound SMTP connections.
 * Use Resend API (https://resend.com) for production - it's simple, reliable, and works on Render.
 * 
 * To use Resend:
 * 1. Sign up at https://resend.com
 * 2. Get your API key
 * 3. Set RESEND_API_KEY environment variable
 * 4. Set RESEND_FROM_EMAIL (e.g., "onboarding@resend.dev" or your verified domain)
 * 
 * SMTP will be used as fallback if Resend is not configured.
 */

// Initialize Resend client if API key is available
let resendClient = null;
if (process.env.RESEND_API_KEY) {
  try {
    resendClient = new Resend(process.env.RESEND_API_KEY);
    logger.info('Resend client initialized', {
      hasApiKey: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'NOT SET',
    });
  } catch (error) {
    logger.error('Failed to initialize Resend client', { error: error.message });
  }
}

/**
 * Create reusable transporter object using SMTP (fallback method)
 */
const createTransporter = () => {
  // If SMTP is not configured, return null
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const isSecure = port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 3,
    rateDelta: 1000,
    rateLimit: 5,
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  });

  logger.info('SMTP transporter created', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER,
  });

  return transporter;
};

/**
 * Send password reset email using Resend API or SMTP fallback
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  console.log('=== sendPasswordResetEmail CALLED ===');
  console.log('Email:', email);
  console.log('Token length:', resetToken?.length);
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  const emailContent = {
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

  // Try Resend first (recommended for Render)
  if (resendClient && process.env.RESEND_FROM_EMAIL) {
    try {
      logger.info('Sending password reset email via Resend', { email });
      
      const { data, error } = await resendClient.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }

      logger.info('Password reset email sent successfully via Resend', {
        email,
        messageId: data?.id,
      });

      console.log('Email sent via Resend! Message ID:', data?.id);
      return { messageId: data?.id, response: 'Sent via Resend' };
    } catch (error) {
      logger.error('Resend email send failed, falling back to SMTP', {
        error: error.message,
        email,
      });
      // Fall through to SMTP fallback
    }
  }

  // Fallback to SMTP
  logger.info('Using SMTP fallback for password reset email', { email });
  const transporter = createTransporter();

  if (!transporter) {
    logger.error('Neither Resend nor SMTP is configured', {
      hasResend: !!resendClient,
      hasResendFromEmail: !!process.env.RESEND_FROM_EMAIL,
      hasSmtpHost: !!process.env.SMTP_HOST,
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
    });
    throw new Error('Email service not configured. Please configure RESEND_API_KEY and RESEND_FROM_EMAIL, or SMTP settings.');
  }

  try {
    const mailOptions = {
      from: `"Multi-Tenant SaaS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    };

    logger.info('Sending password reset email via SMTP', { to: email, from: process.env.SMTP_USER });
    
    // Retry logic with exponential backoff for SMTP
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Attempting to send email via SMTP (attempt ${attempt}/${maxRetries})`, { email });
        
        const sendWithTimeout = Promise.race([
          transporter.sendMail(mailOptions),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SMTP send timeout after 60s')), 60000)
          ),
        ]);

        const info = await sendWithTimeout;
        
        logger.info(`Password reset email sent successfully via SMTP`, {
          email,
          messageId: info.messageId,
          response: info.response,
          attempt,
        });
        
        console.log('Email sent via SMTP! Message ID:', info.messageId);
        return info;
      } catch (error) {
        lastError = error;
        const isTimeout = error.code === 'ETIMEDOUT' || error.message?.includes('timeout');
        const isConnectionError = error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET';
        
        logger.warn(`SMTP email send attempt ${attempt} failed`, {
          error: error.message,
          code: error.code,
          attempt,
          willRetry: attempt < maxRetries && (isTimeout || isConnectionError),
        });
        
        if (attempt < maxRetries && (isTimeout || isConnectionError)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          logger.info(`Retrying SMTP email send after ${delay}ms`, { attempt: attempt + 1 });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error('=== SMTP ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    logger.error(`Error sending password reset email via SMTP`, {
      error: error.message,
      stack: error.stack,
      code: error.code,
    });
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

/**
 * Send invitation email using Resend API or SMTP fallback
 * @param {string} email - Recipient email
 * @param {string} invitationToken - Invitation token
 * @param {string} organizationId - Organization ID
 */
export const sendInvitationEmail = async (email, invitationToken, organizationId) => {
  // Get organization name for email
  const organization = await Organization.findById(organizationId);
  const orgName = organization ? organization.name : 'the organization';

  const acceptUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation/${invitationToken}`;

  const emailContent = {
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

  // Try Resend first (recommended for Render)
  if (resendClient && process.env.RESEND_FROM_EMAIL) {
    try {
      logger.info('Sending invitation email via Resend', { email, organizationId });
      
      const { data, error } = await resendClient.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }

      logger.info('Invitation email sent successfully via Resend', {
        email,
        organizationId,
        messageId: data?.id,
      });

      return { messageId: data?.id, response: 'Sent via Resend' };
    } catch (error) {
      logger.error('Resend email send failed, falling back to SMTP', {
        error: error.message,
        email,
      });
      // Fall through to SMTP fallback
    }
  }

  // Fallback to SMTP
  logger.info('Using SMTP fallback for invitation email', { email });
  const transporter = createTransporter();

  if (!transporter) {
    logger.error('Neither Resend nor SMTP is configured', {
      hasResend: !!resendClient,
      hasResendFromEmail: !!process.env.RESEND_FROM_EMAIL,
      hasSmtpHost: !!process.env.SMTP_HOST,
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
    });
    throw new Error('Email service not configured. Please configure RESEND_API_KEY and RESEND_FROM_EMAIL, or SMTP settings.');
  }

  try {
    const mailOptions = {
      from: `"Multi-Tenant SaaS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    };

    // Retry logic with exponential backoff for SMTP
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Attempting to send invitation email via SMTP (attempt ${attempt}/${maxRetries})`, { email });
        
        const sendWithTimeout = Promise.race([
          transporter.sendMail(mailOptions),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SMTP send timeout after 60s')), 60000)
          ),
        ]);

        const info = await sendWithTimeout;
        
        logger.info(`Invitation email sent successfully via SMTP`, {
          email,
          messageId: info.messageId,
          response: info.response,
          attempt,
        });
        
        return info;
      } catch (error) {
        lastError = error;
        const isTimeout = error.code === 'ETIMEDOUT' || error.message?.includes('timeout');
        const isConnectionError = error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET';
        
        logger.warn(`SMTP invitation email send attempt ${attempt} failed`, {
          error: error.message,
          code: error.code,
          attempt,
          willRetry: attempt < maxRetries && (isTimeout || isConnectionError),
        });
        
        if (attempt < maxRetries && (isTimeout || isConnectionError)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          logger.info(`Retrying SMTP invitation email send after ${delay}ms`, { attempt: attempt + 1 });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  } catch (error) {
    logger.error(`Error sending invitation email via SMTP: ${error.message}`, {
      error: error.message,
      stack: error.stack,
      code: error.code,
    });
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};
