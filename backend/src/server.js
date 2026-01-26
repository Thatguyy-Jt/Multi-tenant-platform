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

// Log CORS configuration on startup
logger.info(`CORS Configuration - Frontend URL: ${envConfig.frontendUrl}`);
logger.info(`CORS Configuration - Environment: ${envConfig.env}`);

// Initialize Express app
const app = express();

// Trust proxy (important for production behind reverse proxy)
if (envConfig.isProduction) {
  app.set('trust proxy', 1);
}

// Connect to MongoDB (non-blocking - server will start even if DB connection fails initially)
// This prevents the server from crashing if DB is temporarily unavailable
connectDB().catch((error) => {
  logger.error(`Failed to connect to MongoDB on startup: ${error.message}`);
  logger.warn('Server will continue to start, but database operations will fail until connection is established');
  // Don't exit - let the server start and retry connection
});

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
    // Normalize origins (remove trailing slashes, convert to lowercase for comparison)
    const normalizeOrigin = (url) => {
      if (!url) return url;
      return url.replace(/\/$/, '').toLowerCase();
    };

    // Build allowed origins list - include both the configured URL and common Vercel patterns
    const allowedOrigins = [
      envConfig.frontendUrl,
      // Allow any Vercel deployment of this project
      ...(envConfig.isProduction ? [
        'https://m0tion.vercel.app',
        'https://multi-tenant-platform-ten.vercel.app',
        // Pattern match for any vercel.app subdomain
        /^https:\/\/.*\.vercel\.app$/,
      ] : []),
      ...(envConfig.isDevelopment ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : []),
    ].filter(Boolean);

    const normalizedOrigin = normalizeOrigin(origin);

    // Allow requests with no origin (mobile apps, Postman, etc.) in development
    if (!origin && envConfig.isDevelopment) {
      logger.info('CORS: Allowing request with no origin (development mode)');
      return callback(null, true);
    }

    // Check if origin is allowed
    let isAllowed = false;
    
    if (!origin) {
      // Allow requests with no origin (for same-origin requests)
      isAllowed = true;
    } else {
      // Check against string origins
      const stringOrigins = allowedOrigins.filter(o => typeof o === 'string');
      const normalizedStringOrigins = stringOrigins.map(normalizeOrigin);
      
      if (normalizedStringOrigins.includes(normalizedOrigin)) {
        isAllowed = true;
      } else {
        // Check against regex patterns (for Vercel subdomains)
        const regexOrigins = allowedOrigins.filter(o => o instanceof RegExp);
        for (const regex of regexOrigins) {
          if (regex.test(origin)) {
            isAllowed = true;
            break;
          }
        }
      }
    }

    if (isAllowed) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/1bfdac8b-041c-443a-abd5-a37cb47a372e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:120',message:'CORS origin ALLOWED',data:{origin,normalizedOrigin,isProduction:envConfig.isProduction,frontendUrl:envConfig.frontendUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'K'})}).catch(()=>{});
      // #endregion
      logger.info(`CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/1bfdac8b-041c-443a-abd5-a37cb47a372e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:125',message:'CORS origin BLOCKED',data:{origin,normalizedOrigin,allowedOrigins:allowedOrigins.filter(o=>typeof o==='string')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'L'})}).catch(()=>{});
      // #endregion
      logger.warn(`CORS: Blocked origin: ${origin}. Allowed origins: ${allowedOrigins.filter(o => typeof o === 'string').join(', ')}`);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true, // CRITICAL: Must be true for cookies to work
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-Response-Time', 'Set-Cookie'], // Expose Set-Cookie for debugging
  maxAge: 86400, // 24 hours
  preflightContinue: false,
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
  // Log response headers after response is sent (for debugging cookies)
  const originalEnd = res.end;
  res.end = function(...args) {
    if (req.path.includes('/auth/login') || req.path.includes('/auth/signup')) {
      const setCookieHeader = res.getHeader('Set-Cookie');
      const allHeaders = res.getHeaders();
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/1bfdac8b-041c-443a-abd5-a37cb47a372e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:156',message:'Response END - final headers check',data:{path:req.path,statusCode:res.statusCode,hasSetCookie:!!setCookieHeader,setCookieValue:Array.isArray(setCookieHeader)?setCookieHeader[0]:setCookieHeader,allHeaders:Object.keys(allHeaders),headersSent:res.headersSent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
      
      logger.info('Response sent with headers', {
        path: req.path,
        statusCode: res.statusCode,
        hasSetCookie: !!setCookieHeader,
        setCookieValue: Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader,
        responseHeaders: Object.keys(res.getHeaders()),
      });
    }
    originalEnd.apply(this, args);
  };
  
  // #region agent log
  if (req.path.includes('/auth/login') || req.path.includes('/auth/me')) {
    fetch('http://127.0.0.1:7243/ingest/1bfdac8b-041c-443a-abd5-a37cb47a372e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:175',message:'Request received',data:{method:req.method,path:req.path,origin:req.get('origin'),hasCookies:!!req.cookies,cookieKeys:req.cookies?Object.keys(req.cookies):[],cookieHeader:req.get('cookie')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
  }
  // #endregion
  
  logger.info({
    message: `${req.method} ${req.path}`,
    method: req.method,
    path: req.path,
    ip: req.ip,
    requestId: req.id,
    origin: req.get('origin'),
    userAgent: req.get('user-agent'),
    cookies: req.cookies ? Object.keys(req.cookies) : [],
    cookieHeader: req.get('cookie'),
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

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Multi-Tenant SaaS API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      docs: 'See API documentation for available endpoints',
    },
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Multi-Tenant SaaS API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      organization: '/api/organization',
      projects: '/api/projects',
      tasks: '/api/tasks',
      dashboard: '/api/dashboard',
      billing: '/api/billing',
    },
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
