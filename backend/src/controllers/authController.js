import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { generateToken } from '../utils/jwt.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

/**
 * @desc    Register new user and create organization
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req, res, next) => {
  try {
    const { email, password, organizationName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User already exists with this email',
        },
      });
    }

    // Create organization first
    const organization = await Organization.create({
      name: organizationName,
    });

    // Create user with owner role
    const user = await User.create({
      email,
      password,
      role: 'owner',
      organizationId: organization._id,
      tenantId: organization.tenantId,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Set HTTP-only cookie with enhanced security
    setAuthCookie(res, token);

    logger.info(`New user registered: ${email} (Organization: ${organization.name})`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          tenantId: user.tenantId,
        },
        organization: {
          id: organization._id,
          name: organization.name,
          tenantId: organization.tenantId,
          subscriptionPlan: organization.subscriptionPlan,
        },
      },
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    logger.info('Login attempt received', { 
      email: req.body?.email,
      hasPassword: !!req.body?.password,
      origin: req.get('origin'),
      ip: req.ip 
    });

    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn('Login attempt with missing credentials');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
        },
      });
    }

    // Find user and include password (since it's select: false by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn(`Login failed: User not found for email: ${email}`);
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
        },
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      logger.warn(`Login failed: Invalid password for email: ${email}`);
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
        },
      });
    }

    // Get organization
    const organization = await Organization.findById(user.organizationId);

    if (!organization) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Organization not found',
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    logger.info(`JWT token generated for user: ${email}, token length: ${token.length}`);

    // Set HTTP-only cookie with enhanced security
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/1bfdac8b-041c-443a-abd5-a37cb47a372e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authController.js:143',message:'BEFORE setAuthCookie call',data:{email,hasToken:!!token,responseHeadersSent:res.headersSent,statusCode:res.statusCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    try {
      setAuthCookie(res, token);
      
      // #region agent log
      const setCookieAfter = res.getHeader('Set-Cookie');
      fetch('http://127.0.0.1:7243/ingest/1bfdac8b-041c-443a-abd5-a37cb47a372e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authController.js:149',message:'AFTER setAuthCookie call',data:{email,hasSetCookie:!!setCookieAfter,setCookieValue:Array.isArray(setCookieAfter)?setCookieAfter[0]:setCookieAfter,responseHeadersSent:res.headersSent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      
      logger.info(`Cookie set successfully for user: ${email}`);
      logger.info(`Cookie configuration: secure=${process.env.NODE_ENV === 'production'}, sameSite=${process.env.NODE_ENV === 'production' ? 'none' : 'lax'}`);
      
      // Log the actual Set-Cookie header that will be sent
      const setCookieHeader = res.getHeader('Set-Cookie');
      logger.info('Set-Cookie header in response', {
        hasHeader: !!setCookieHeader,
        headerValue: Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader,
      });
    } catch (cookieError) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/1bfdac8b-041c-443a-abd5-a37cb47a372e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authController.js:161',message:'Cookie setting ERROR',data:{email,error:cookieError.message,stack:cookieError.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      logger.error(`Failed to set cookie: ${cookieError.message}`);
      // Continue anyway - token is generated, just cookie setting failed
    }

    logger.info(`User logged in successfully: ${email}`);

    // #region agent log
    const finalHeaders = res.getHeader('Set-Cookie');
    fetch('http://127.0.0.1:7243/ingest/1bfdac8b-041c-443a-abd5-a37cb47a372e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authController.js:170',message:'BEFORE res.json() - final check',data:{email,hasSetCookie:!!finalHeaders,setCookieValue:Array.isArray(finalHeaders)?finalHeaders[0]:finalHeaders,responseHeadersSent:res.headersSent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          tenantId: user.tenantId,
        },
        organization: {
          id: organization._id,
          name: organization.name,
          tenantId: organization.tenantId,
          subscriptionPlan: organization.subscriptionPlan,
        },
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req, res) => {
  // Clear authentication cookie
  clearAuthCookie(res);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organizationId);

    if (!organization) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Organization not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          tenantId: user.tenantId,
        },
        organization: {
          id: organization._id,
          name: organization.name,
          tenantId: organization.tenantId,
          subscriptionPlan: organization.subscriptionPlan,
        },
      },
    });
  } catch (error) {
    logger.error(`Get me error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  // Log entry point with console.log for visibility in Render
  console.log('=== FORGOT PASSWORD REQUEST ===');
  console.log('Email:', req.body?.email);
  console.log('Origin:', req.get('origin'));
  console.log('IP:', req.ip);
  
  try {
    const { email } = req.body;
    
    logger.info('Forgot password request received', {
      email: req.body?.email,
      origin: req.get('origin'),
      ip: req.ip,
    });

    const user = await User.findOne({ email });
    
    console.log('User found:', !!user);

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a password reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    console.log('Reset token generated:', resetToken);
    console.log('SMTP Configuration Check:');
    console.log('  SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
    console.log('  SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
    console.log('  SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
    console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');
    console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');

    try {
      logger.info('Attempting to send password reset email', {
        email: user.email,
        hasSmtpHost: !!process.env.SMTP_HOST,
        hasSmtpUser: !!process.env.SMTP_USER,
        hasSmtpPass: !!process.env.SMTP_PASS,
      });
      
      console.log('Calling sendPasswordResetEmail...');

      await sendPasswordResetEmail(user.email, resetToken);
      
      console.log('Email sent successfully!');

      logger.info('Password reset email sent successfully', { email: user.email });

      console.log('=== EMAIL SENT SUCCESSFULLY ===');

      res.status(200).json({
        success: true,
        message: 'If that email exists, a password reset link has been sent',
      });
    } catch (error) {
      // Log detailed error information
      console.error('=== EMAIL SEND ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Is timeout?:', error.message?.includes('timeout'));
      
      logger.error('Failed to send password reset email', {
        error: error.message,
        email: user.email,
        resetToken,
        resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`,
        smtpConfig: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          hasPass: !!process.env.SMTP_PASS,
        },
      });
      
      // Log the reset token for testing purposes when email fails
      logger.info(`Password reset token for testing: ${resetToken}`);
      logger.info(`Reset URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`);
      
      // Don't clear the token - keep it so users can test the reset flow
      // The token will expire naturally after the expiry time

      res.status(200).json({
        success: true,
        message: 'If that email exists, a password reset link has been sent',
        // In development, include token in response for testing
        ...(process.env.NODE_ENV !== 'production' && {
          debug: {
            resetToken,
            resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`,
            note: 'Token included for development testing only',
            error: error.message,
          },
        }),
      });
    }
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token to compare with stored hash
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or expired reset token',
        },
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new token and set cookie
    const jwtToken = generateToken(user._id);
    setAuthCookie(res, jwtToken);

    logger.info(`Password reset successful for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    next(error);
  }
};
