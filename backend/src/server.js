import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import connectDB from './config/database.js';
import { getEnvConfig } from './config/env.js';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { performanceMiddleware } from './middleware/performance.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { configureSecurity } from './middleware/security.js';
import authRoutes from './routes/authRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import billingRoutes from './routes/billingRoutes.js';

// Get environment configuration (validates env vars on import)
const envConfig = getEnvConfig();

// Initialize Express app
const app = express();

// Trust proxy (important for production behind reverse proxy)
if (envConfig.isProduction) {
  app.set('trust proxy', 1);
}

// Connect to MongoDB
connectDB();

// Security middleware with production-specific configuration
app.use(
  helmet({
    contentSecurityPolicy: envConfig.isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        }
      : false, // Disable in development for easier debugging
    crossOriginEmbedderPolicy: envConfig.isProduction,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

configureSecurity(app);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin && envConfig.isDevelopment) {
      return callback(null, true);
    }

    // Check if origin is allowed
    const allowedOrigins = [
      envConfig.frontendUrl,
      ...(envConfig.isDevelopment ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : []),
    ];

    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Request ID middleware (must be early in the chain)
app.use(requestIdMiddleware);

// Performance monitoring middleware
app.use(performanceMiddleware);

// Rate limiting
app.use('/api/', apiLimiter);

// Request logging middleware
app.use((req, res, next) => {
  logger.info({
    message: `${req.method} ${req.path}`,
    method: req.method,
    path: req.path,
    ip: req.ip,
    requestId: req.id,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const { getHealthMetrics, getDatabaseHealth } = await import('./utils/monitoring.js');
  
  const healthCheck = {
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: envConfig.env,
    requestId: req.id,
    ...getHealthMetrics(),
  };

  // Check database connection
  healthCheck.database = await getDatabaseHealth();

  const statusCode = healthCheck.database?.status === 'connected' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// API root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Multi-Tenant SaaS API',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/billing', billingRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = envConfig.port;

app.listen(PORT, () => {
  logger.info(`Server running in ${envConfig.env} mode on port ${PORT}`);
  logger.info(`Frontend URL: ${envConfig.frontendUrl}`);
  if (envConfig.isProduction) {
    logger.info('Production mode: Security features enabled');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

export default app;
