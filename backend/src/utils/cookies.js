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
