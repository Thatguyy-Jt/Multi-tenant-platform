import logger from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import { getEnvConfig } from '../config/env.js';

/**
 * Centralized error handling middleware
 * Catches all errors and returns consistent error responses
 */
const errorHandler = (err, req, res, next) => {
  const envConfig = getEnvConfig();
  const requestId = req.id || 'unknown';

  // Default error structure
  let error = {
    message: err.message || 'Server Error',
    statusCode: err.statusCode || 500,
    isOperational: err.isOperational !== undefined ? err.isOperational : false,
  };

  // Handle AppError instances
  if (err instanceof AppError) {
    error = {
      message: err.message,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
      ...(err.errors && { errors: err.errors }),
    };
  }
  // Mongoose bad ObjectId
  else if (err.name === 'CastError') {
    error = {
      message: 'Resource not found',
      statusCode: 404,
      isOperational: true,
    };
  }
  // Mongoose duplicate key
  else if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    error = {
      message: `${field} already exists`,
      statusCode: 409,
      isOperational: true,
    };
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    const errors = {};
    Object.keys(err.errors || {}).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
    error = {
      message: 'Validation failed',
      statusCode: 422,
      isOperational: true,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401,
      isOperational: true,
    };
  }
  else if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401,
      isOperational: true,
    };
  }
  // MongoDB connection errors
  else if (err.name === 'MongoServerError' || err.name === 'MongoNetworkError') {
    error = {
      message: 'Database connection error',
      statusCode: 503,
      isOperational: false,
    };
  }
  // CORS errors
  else if (err.message && err.message.includes('CORS')) {
    error = {
      message: 'CORS policy: Origin not allowed',
      statusCode: 403,
      isOperational: true,
    };
  }

  // Log error with context
  const logData = {
    message: error.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    requestId,
    userAgent: req.get('user-agent'),
    ...(req.tenant && {
      tenantId: req.tenant.tenantId,
      organizationId: req.tenant.organizationId,
      userId: req.tenant.userId,
    }),
  };

  // Include stack trace for non-operational errors or in development
  if (!error.isOperational || envConfig.isDevelopment) {
    logData.stack = err.stack;
  }

  // Log based on severity
  if (error.statusCode >= 500) {
    logger.error(logData);
  } else if (error.statusCode >= 400) {
    logger.warn(logData);
  } else {
    logger.info(logData);
  }

  // Send error response
  const response = {
    success: false,
    error: {
      message: error.message,
      ...(error.errors && { errors: error.errors }),
      ...(envConfig.isDevelopment && {
        stack: err.stack,
        requestId,
      }),
      ...(envConfig.isProduction && requestId && { requestId }),
    },
  };

  res.status(error.statusCode).json(response);
};

export default errorHandler;
