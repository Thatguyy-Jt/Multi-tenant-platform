import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import Organization from '../models/Organization.js';

/**
 * Create reusable transporter object using SMTP
 * 
 * NOTE: Render's free tier blocks outbound SMTP connections.
 * For production, consider using an email API service like:
 * - Resend (https://resend.com) - Recommended, simple API
 * - SendGrid (https://sendgrid.com)
 * - Mailgun (https://mailgun.com)
 */
const createTransporter = () => {
  // If SMTP is not configured, return null (email sending will be skipped)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.error('SMTP not configured. Missing required environment variables.', {
      hasSmtpHost: !!process.env.SMTP_HOST,
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
      smtpHost: process.env.SMTP_HOST || 'NOT SET',
      smtpUser: process.env.SMTP_USER || 'NOT SET',
    });
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const isSecure = port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: isSecure, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Increased timeouts for better reliability
    connectionTimeout: 60000, // 60 seconds - increased from 10s
    greetingTimeout: 30000, // 30 seconds - increased from 10s
    socketTimeout: 60000, // 60 seconds - increased from 10s
    // TLS options for Gmail and other secure SMTP servers
    tls: {
      rejectUnauthorized: true, // Verify SSL certificates
      minVersion: 'TLSv1.2', // Minimum TLS version
    },
    // Connection pool options
    pool: true,
    maxConnections: 1,
    maxMessages: 3,
    // Rate limiting
    rateDelta: 1000,
    rateLimit: 5,
    // Debug mode (set to true for more verbose logging)
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
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  console.log('=== sendPasswordResetEmail CALLED ===');
  console.log('Email:', email);
  console.log('Token length:', resetToken?.length);
  
  const transporter = createTransporter();
  
  console.log('Transporter created:', !!transporter);

  if (!transporter) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    console.error('=== SMTP NOT CONFIGURED ===');
    console.error('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
    console.error('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
    console.error('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
    
    logger.error('SMTP not configured. Cannot send password reset email.', {
      email,
      resetToken,
      resetUrl,
      smtpHost: process.env.SMTP_HOST,
      smtpUser: process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
    });
    // Throw error so controller can handle it properly
    throw new Error('SMTP not configured. Please configure SMTP settings in environment variables.');
  }

  try {
    // Skip SMTP verification - Render blocks outbound SMTP connections
    // We'll try to send directly instead
    console.log('Skipping SMTP verification (Render blocks SMTP connections)');
    logger.info('Skipping SMTP verification - attempting direct send');

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

    console.log('Sending password reset email...');
    console.log('To:', email);
    console.log('From:', process.env.SMTP_USER);
    
    logger.info('Sending password reset email', { to: email, from: process.env.SMTP_USER });
    
    // Retry logic with exponential backoff
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Attempting to send email (attempt ${attempt}/${maxRetries})`, { email });
        
        // Increased timeout to 60 seconds to match connection timeout
        const sendWithTimeout = Promise.race([
          transporter.sendMail(mailOptions),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SMTP send timeout after 60s')), 60000)
          ),
        ]);

        const info = await sendWithTimeout;
        
        console.log('Email sent! Message ID:', info.messageId);
        console.log('Response:', info.response);
        
        logger.info(`Password reset email sent successfully`, {
          email,
          messageId: info.messageId,
          response: info.response,
          attempt,
        });
        
        return info; // Success, return the info object
      } catch (error) {
        lastError = error;
        const isTimeout = error.code === 'ETIMEDOUT' || error.message?.includes('timeout');
        const isConnectionError = error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET';
        
        logger.warn(`Email send attempt ${attempt} failed`, {
          error: error.message,
          code: error.code,
          attempt,
          willRetry: attempt < maxRetries && (isTimeout || isConnectionError),
        });
        
        // Only retry on timeout or connection errors, and if we have retries left
        if (attempt < maxRetries && (isTimeout || isConnectionError)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
          logger.info(`Retrying email send after ${delay}ms`, { attempt: attempt + 1 });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's not a retryable error or we're out of retries, throw
        throw error;
      }
    }
    
    // If we get here, all retries failed
    throw lastError;
  } catch (error) {
    console.error('=== SMTP ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    console.error('Error response:', error.response);
    console.error('Error responseCode:', error.responseCode);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Is timeout?:', error.message?.includes('timeout'));
    
    logger.error(`Error sending password reset email`, {
      error: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      name: error.name,
    });
    throw new Error(`Email could not be sent: ${error.message}`);
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
    logger.error('SMTP not configured. Cannot send invitation email.', {
      email,
      invitationToken,
      organizationId,
      acceptUrl,
      smtpHost: process.env.SMTP_HOST,
      smtpUser: process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
    });
    // Throw error so controller can handle it properly
    throw new Error('SMTP not configured. Please configure SMTP settings in environment variables.');
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

    // Retry logic with exponential backoff
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Attempting to send invitation email (attempt ${attempt}/${maxRetries})`, { email });
        
        // Increased timeout to 60 seconds to match connection timeout
        const sendWithTimeout = Promise.race([
          transporter.sendMail(mailOptions),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SMTP send timeout after 60s')), 60000)
          ),
        ]);

        const info = await sendWithTimeout;
        
        logger.info(`Invitation email sent successfully to ${email}`, {
          messageId: info.messageId,
          response: info.response,
          attempt,
        });
        
        return info; // Success, return the info object
      } catch (error) {
        lastError = error;
        const isTimeout = error.code === 'ETIMEDOUT' || error.message?.includes('timeout');
        const isConnectionError = error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET';
        
        logger.warn(`Invitation email send attempt ${attempt} failed`, {
          error: error.message,
          code: error.code,
          attempt,
          willRetry: attempt < maxRetries && (isTimeout || isConnectionError),
        });
        
        // Only retry on timeout or connection errors, and if we have retries left
        if (attempt < maxRetries && (isTimeout || isConnectionError)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
          logger.info(`Retrying invitation email send after ${delay}ms`, { attempt: attempt + 1 });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's not a retryable error or we're out of retries, throw
        throw error;
      }
    }
    
    // If we get here, all retries failed
    throw lastError;
  } catch (error) {
    logger.error(`Error sending invitation email: ${error.message}`, {
      error: error.message,
      stack: error.stack,
      code: error.code,
    });
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};
