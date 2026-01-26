import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 */
export const generateToken = (userId) => {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
