import mongoose from 'mongoose';
import { getEnvConfig } from './env.js';
import logger from '../utils/logger.js';

/**
 * Connect to MongoDB database
 * Handles connection, error events, and disconnection
 * Optimized for production with connection pooling
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const envConfig = getEnvConfig();

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connection options optimized for production
    const options = {
      // Connection pool settings
      maxPoolSize: envConfig.isProduction ? 10 : 5, // Maximum number of connections in the pool
      minPoolSize: envConfig.isProduction ? 5 : 2, // Minimum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server before timing out
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take before timing out
      family: 4, // Use IPv4, skip trying IPv6

      // Write concern for production
      ...(envConfig.isProduction && {
        writeConcern: {
          w: 'majority', // Write to majority of replica set members
          j: true, // Wait for journal commit
        },
      }),

      // Retry settings
      retryWrites: true,
      retryReads: true,
    };

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Connection pool: min=${options.minPoolSize}, max=${options.maxPoolSize}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Log connection pool status
    mongoose.connection.on('connected', () => {
      const poolSize = mongoose.connection.readyState === 1 
        ? mongoose.connection.db?.serverConfig?.poolSize || 'unknown'
        : 'disconnected';
      logger.info(`MongoDB connection pool size: ${poolSize}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Closing MongoDB connection...`);
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        logger.error(`Error closing MongoDB connection: ${error.message}`);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    if (error.name === 'MongoServerSelectionError') {
      logger.error('Could not connect to MongoDB. Please check your connection string and network settings.');
    }
    process.exit(1);
  }
};

export default connectDB;
