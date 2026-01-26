import logger from '../utils/logger.js';

/**
 * Performance Monitoring Middleware
 * Tracks request duration and logs slow requests
 */
export const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsed = ((endMemory - startMemory) / 1024 / 1024).toFixed(2); // MB

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn({
        message: 'Slow request detected',
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        memoryUsed: `${memoryUsed}MB`,
        requestId: req.id,
        ip: req.ip,
      });
    }

    // Log very slow requests (> 5 seconds) as errors
    if (duration > 5000) {
      logger.error({
        message: 'Very slow request detected',
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        memoryUsed: `${memoryUsed}MB`,
        requestId: req.id,
        ip: req.ip,
      });
    }

    // Add performance headers
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('X-Memory-Used', `${memoryUsed}MB`);

    // Call original end
    originalEnd.call(this, chunk, encoding);
  };

  next();
};
