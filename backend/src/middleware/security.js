import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import { getEnvConfig } from '../config/env.js';

/**
 * Configure security middleware
 * @param {Object} app - Express app instance
 */
export const configureSecurity = (app) => {
  const envConfig = getEnvConfig();

  // Sanitize data (prevent NoSQL injection)
  app.use(
    mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        // Log sanitization in production for monitoring
        if (envConfig.isProduction) {
          console.warn(`Sanitized NoSQL injection attempt: ${key} in ${req.path}`);
        }
      },
    })
  );

  // Prevent XSS attacks
  app.use(xss());

  // Prevent HTTP Parameter Pollution
  app.use(
    hpp({
      whitelist: [
        // Add any query parameters that should allow multiple values
        'filter',
        'sort',
        'page',
        'limit',
      ],
    })
  );
};
