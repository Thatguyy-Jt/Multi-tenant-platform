import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { getEnvConfig } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envConfig = getEnvConfig();

// Define log format with additional metadata
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  // Add environment and service metadata
  winston.format.metadata({
    fillWith: ['service', 'environment', 'requestId', 'tenantId'],
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logs directory path
const logsDir = path.join(__dirname, '../../logs');

// Ensure logs directory exists
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

// Create logger instance
const logger = winston.createLogger({
  level: envConfig.logLevel,
  format: logFormat,
  defaultMeta: {
    service: 'multi-tenant-saas-api',
    environment: envConfig.env,
  },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Separate access log for production
    ...(envConfig.isProduction
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, 'access.log'),
            level: 'info',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json()
            ),
          }),
        ]
      : []),
  ],
});

// Always add console transport so logs appear in Render/Vercel
// In production, use simple format; in development, use colored format
logger.add(
  new winston.transports.Console({
    format: envConfig.isProduction 
      ? winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
            const extra = { ...meta };
            delete extra.level;
            delete extra.message;
            if (Object.keys(extra).length > 0) {
              msg += ` ${JSON.stringify(extra)}`;
            }
            return msg;
          })
        )
      : consoleFormat,
  })
);

export default logger;
