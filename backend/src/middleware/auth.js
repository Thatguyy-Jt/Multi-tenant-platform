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

    // Debug logging in development
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Auth check - Cookies: ${JSON.stringify(req.cookies)}, Has token: ${!!token}`);
    }

    // Make sure token exists
    if (!token) {
      logger.warn(`Auth failed - No token found. Cookies: ${JSON.stringify(req.cookies)}`);
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
