import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * Authentication middleware
 * Verifies JWT token from cookie and attaches user to request
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Enhanced debug logging
    logger.info('Auth middleware check', {
      hasCookies: !!req.cookies,
      cookies: req.cookies ? Object.keys(req.cookies) : [],
      hasToken: !!token,
      tokenLength: token?.length,
      origin: req.get('origin'),
      referer: req.get('referer'),
      cookieHeader: req.get('cookie'),
    });

    // Make sure token exists
    if (!token) {
      logger.warn('Auth failed - No token found', {
        cookies: req.cookies ? Object.keys(req.cookies) : [],
        cookieHeader: req.get('cookie'),
        origin: req.get('origin'),
      });
      return res.status(401).json({
        success: false,
        error: {
          message: 'Not authorized to access this route',
        },
      });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Get user from token (exclude password)
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      logger.error(`Token verification error: ${error.message}`);
      return res.status(401).json({
        success: false,
        error: {
          message: 'Not authorized to access this route',
        },
      });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
      },
    });
  }
};

/**
 * Optional auth: attach user if token present, but do not 401 if missing.
 * Use for routes that work both with and without auth (e.g. logout).
 */
export const optionalProtect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return next();
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};
