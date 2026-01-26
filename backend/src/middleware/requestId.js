import { randomBytes } from 'crypto';

/**
 * Request ID Middleware
 * Adds a unique request ID to each request for tracking and debugging
 */
export const requestIdMiddleware = (req, res, next) => {
  // Generate or use existing request ID
  req.id = req.headers['x-request-id'] || randomBytes(8).toString('hex');
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);
  
  // Attach to response for logging
  res.locals.requestId = req.id;
  
  next();
};
