/**
 * Monitoring Utilities
 * Provides functions for application monitoring and metrics
 */

import logger from './logger.js';
import { getEnvConfig } from './config/env.js';

const envConfig = getEnvConfig();

/**
 * Track API usage metrics
 */
export const trackApiUsage = (req, res, next) => {
  // This can be extended to send metrics to external services
  // For now, we'll just log important metrics
  const metrics = {
    endpoint: `${req.method} ${req.path}`,
    statusCode: res.statusCode,
    requestId: req.id,
    timestamp: new Date().toISOString(),
  };

  // Log metrics for important endpoints
  if (envConfig.isProduction) {
    logger.info({
      message: 'API usage metric',
      ...metrics,
    });
  }

  next();
};

/**
 * Track error rate
 */
export const trackError = (error, context = {}) => {
  const errorData = {
    message: error.message,
    name: error.name,
    statusCode: error.statusCode || 500,
    ...context,
    timestamp: new Date().toISOString(),
  };

  logger.error({
    message: 'Error tracked',
    ...errorData,
  });

  // In production, you might want to send this to an error tracking service
  // Example: Sentry, Rollbar, etc.
  if (envConfig.isProduction && error.statusCode >= 500) {
    // sendToErrorTrackingService(errorData);
  }
};

/**
 * Get application health metrics
 */
export const getHealthMetrics = () => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();

  return {
    uptime: {
      seconds: Math.floor(uptime),
      formatted: formatUptime(uptime),
    },
    memory: {
      heapUsed: formatBytes(memUsage.heapUsed),
      heapTotal: formatBytes(memUsage.heapTotal),
      rss: formatBytes(memUsage.rss),
      external: formatBytes(memUsage.external),
    },
    cpu: {
      usage: process.cpuUsage(),
    },
    environment: envConfig.env,
    nodeVersion: process.version,
  };
};

/**
 * Format bytes to human-readable format
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format uptime to human-readable format
 */
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

/**
 * Monitor database connection health
 */
export const getDatabaseHealth = async () => {
  try {
    const mongoose = await import('mongoose');
    const connection = mongoose.default.connection;

    return {
      status: connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: connection.readyState,
      host: connection.host,
      name: connection.name,
      models: Object.keys(connection.models).length,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
    };
  }
};
