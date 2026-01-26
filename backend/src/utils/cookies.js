/**
 * Cookie utility functions
 * Standardizes cookie configuration across the application
 */

import logger from './logger.js';

/**
 * Get cookie options based on environment
 * @returns {Object} Cookie options
 */
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // For cross-origin requests (different domains), we need sameSite: 'none' with secure: true
  // sameSite: 'strict' only works for same-site requests
  // sameSite: 'none' requires secure: true (HTTPS)
  return {
    httpOnly: true,
    secure: isProduction, // Required for sameSite: 'none' and HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin, 'lax' for development
    path: '/',
    // Don't set domain for cross-origin cookies - let browser handle it
    // Setting domain restricts which domains can receive the cookie
  };
};

/**
 * Set authentication token cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 * @param {number} maxAge - Max age in milliseconds (default: 7 days)
 */
export const setAuthCookie = (res, token, maxAge = 7 * 24 * 60 * 60 * 1000) => {
  const options = {
    ...getCookieOptions(),
    maxAge,
  };
  
  // Log cookie configuration for debugging
  logger.info('Setting auth cookie', {
    secure: options.secure,
    sameSite: options.sameSite,
    httpOnly: options.httpOnly,
    path: options.path,
    maxAge: maxAge,
    hasToken: !!token,
    tokenLength: token?.length,
  });
  
  res.cookie('token', token, options);
  
  // Verify cookie was set by checking response headers
  const setCookieHeader = res.getHeader('Set-Cookie');
  logger.info('Cookie set in response', {
    hasSetCookieHeader: !!setCookieHeader,
    setCookieValue: Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader,
  });
};

/**
 * Clear authentication token cookie
 * @param {Object} res - Express response object
 */
export const clearAuthCookie = (res) => {
  res.cookie('token', '', {
    ...getCookieOptions(),
    expires: new Date(0),
  });
};
