import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface DatabaseConnectionOptions {
  uri?: string;
  maxRetries?: number;
  retryIntervalMs?: number;
}

export class Database {
  private static isConnected = false;

  /**
   * Initialize MongoDB connection with retry mechanism
   */
  public static async connect(options?: DatabaseConnectionOptions): Promise<typeof mongoose> {
    const mongoUri = options?.uri || env.MONGODB_URI;
    const maxRetries = options?.maxRetries ?? 3;
    const retryInterval = options?.retryIntervalMs ?? 3000;

    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        attempt++;
        logger.info(`Connecting to MongoDB (attempt ${attempt}/${maxRetries})...`);

        mongoose.connection.on('connected', () => {
          Database.isConnected = true;
          logger.info('MongoDB connection established successfully.');
        });

        mongoose.connection.on('error', (err) => {
          Database.isConnected = false;
          logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
          Database.isConnected = false;
          logger.warn('MongoDB connection lost. Disconnected.');
        });

        const connection = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 10000,
        });

        Database.isConnected = true;
        return connection;
      } catch (error) {
        Database.isConnected = false;
        logger.error(`Failed to connect to MongoDB on attempt ${attempt}:`, error);

        if (attempt >= maxRetries) {
          if (!mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
            logger.warn('Primary MongoDB URI unreachable. Attempting fallback to local MongoDB instance...');
            try {
              const fallbackConnection = await mongoose.connect('mongodb://127.0.0.1:27017/solace-ai', {
                serverSelectionTimeoutMS: 3000,
              });
              Database.isConnected = true;
              logger.info('Connected to local MongoDB instance fallback successfully.');
              return fallbackConnection;
            } catch (fallbackError) {
              logger.error('Local fallback MongoDB connection failed:', fallbackError);
            }
          }

          throw new Error(
            `Unable to establish MongoDB connection after ${maxRetries} attempts at ${mongoUri}. ` +
              'Please verify that MongoDB is running and reachable.',
          );
        }

        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }

    throw new Error('MongoDB connection sequence failed.');
  }

  /**
   * Disconnect cleanly from MongoDB
   */
  public static async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      logger.info('Closing MongoDB connection...');
      await mongoose.disconnect();
      Database.isConnected = false;
      logger.info('MongoDB disconnected cleanly.');
    }
  }

  /**
   * Check connection status
   */
  public static get status(): { isConnected: boolean; readyState: number } {
    return {
      isConnected: Database.isConnected && mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
    };
  }
}
