import express from 'express';
import {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../utils/validators.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Log all requests to auth routes for debugging
router.use((req, res, next) => {
  console.log(`[AUTH ROUTE] ${req.method} ${req.path}`, {
    origin: req.get('origin'),
    ip: req.ip,
    hasBody: !!req.body,
  });
  logger.info(`Auth route accessed: ${req.method} ${req.path}`, {
    origin: req.get('origin'),
    ip: req.ip,
    hasBody: !!req.body,
  });
  next();
});

// Public routes with strict rate limiting
router.post('/signup', authLimiter, validateSignup, signup);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', authLimiter, validateResetPassword, resetPassword);

// Protected routes (less strict rate limiting via apiLimiter if needed)
router.get('/me', protect, getMe);

export default router;
