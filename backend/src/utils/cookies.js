/**
 * Cookie utility functions
 * Standardizes cookie configuration across the application
 */

/**
 * Get cookie options based on environment
 * @returns {Object} Cookie options
 */
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax', // Strict in production, lax in development
    path: '/',
    ...(isProduction && process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
  };
};

/**
 * Set authentication token cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 * @param {number} maxAge - Max age in milliseconds (default: 7 days)
 */
export const setAuthCookie = (res, token, maxAge = 7 * 24 * 60 * 60 * 1000) => {
  res.cookie('token', token, {
    ...getCookieOptions(),
    maxAge,
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
