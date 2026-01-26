/**
 * Monitoring Configuration
 * Setup for error tracking and monitoring services
 */

import { getEnvConfig } from './env.js';

const envConfig = getEnvConfig();

/**
 * Initialize error tracking service (e.g., Sentry)
 * Uncomment and configure when ready to use
 */
export const initErrorTracking = () => {
  if (!envConfig.isProduction) {
    return null;
  }

  // Example: Sentry initialization
  // if (process.env.SENTRY_DSN) {
  //   const Sentry = require('@sentry/node');
  //   Sentry.init({
  //     dsn: process.env.SENTRY_DSN,
  //     environment: envConfig.env,
  //     tracesSampleRate: 0.1, // 10% of transactions
  //   });
  //   return Sentry;
  // }

  return null;
};

/**
 * Initialize application performance monitoring (APM)
 * Uncomment and configure when ready to use
 */
export const initAPM = () => {
  if (!envConfig.isProduction) {
    return null;
  }

  // Example: New Relic, DataDog, etc.
  // if (process.env.NEW_RELIC_LICENSE_KEY) {
  //   require('newrelic');
  // }

  return null;
};

/**
 * Get monitoring configuration
 */
export const getMonitoringConfig = () => {
  return {
    errorTracking: {
      enabled: !!process.env.SENTRY_DSN,
      service: 'sentry', // or 'rollbar', 'bugsnag', etc.
    },
    apm: {
      enabled: !!process.env.NEW_RELIC_LICENSE_KEY,
      service: 'newrelic', // or 'datadog', etc.
    },
    logging: {
      level: envConfig.logLevel,
      fileLogging: true,
      consoleLogging: !envConfig.isProduction,
    },
  };
};
