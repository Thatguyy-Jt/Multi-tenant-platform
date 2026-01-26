import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment variable validation
 * Ensures all required variables are set before the app starts
 */
const requiredEnvVars = {
  development: [
    'MONGODB_URI',
    'JWT_SECRET',
    'COOKIE_SECRET',
  ],
  production: [
    'MONGODB_URI',
    'JWT_SECRET',
    'COOKIE_SECRET',
    'NODE_ENV',
    'FRONTEND_URL',
  ],
};

const optionalEnvVars = {
  PORT: '5000',
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
  FRONTEND_URL: 'http://localhost:3000',
  SMTP_HOST: '',
  SMTP_PORT: '',
  SMTP_USER: '',
  SMTP_PASS: '',
  STRIPE_SECRET_KEY: '',
  STRIPE_WEBHOOK_SECRET: '',
};

/**
 * Validate environment variables
 */
export const validateEnv = () => {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || requiredEnvVars.development;
  const missing = [];

  required.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for ${env} environment: ${missing.join(', ')}`
    );
  }

  // Set defaults for optional variables
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key] && defaultValue !== '') {
      process.env[key] = defaultValue;
    }
  });

  // Validate JWT_SECRET strength in production
  if (env === 'production' && process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error(
        'JWT_SECRET must be at least 32 characters long in production'
      );
    }
  }

  // Validate COOKIE_SECRET strength in production
  if (env === 'production' && process.env.COOKIE_SECRET) {
    if (process.env.COOKIE_SECRET.length < 32) {
      throw new Error(
        'COOKIE_SECRET must be at least 32 characters long in production'
      );
    }
  }
};

/**
 * Get environment configuration
 */
export const getEnvConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  return {
    env,
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isTest: env === 'test',
    port: parseInt(process.env.PORT || '5000', 10),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    cookieSecret: process.env.COOKIE_SECRET,
    logLevel: process.env.LOG_LEVEL || 'info',
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  };
};

// Validate on import
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export default getEnvConfig();
