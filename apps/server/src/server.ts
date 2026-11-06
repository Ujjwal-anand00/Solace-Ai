import { Server } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { Database } from './database';
import { logger } from './utils/logger';
import { NotificationScheduler } from './modules/notifications/notification.scheduler';

let server: Server | null = null;

const startServer = async (): Promise<void> => {
  try {
    logger.info('Starting Solace AI Backend initialization sequence...');
    logger.info(`Environment: ${env.NODE_ENV}`);

    // Step 1: Connect to Database (Server starts ONLY after DB is connected)
    await Database.connect();

    // Step 2: Initialize Express App
    const app = createApp();

    // Step 3: Listen on configured port
    server = app.listen(env.PORT, () => {
      logger.info(` Solace AI API server running at http://localhost:${env.PORT}`);
      logger.info(` Health endpoint available at http://localhost:${env.PORT}/api/v1/health`);

      // Step 4: Start Notification Background Scheduler
      NotificationScheduler.start();
    });
  } catch (error) {
    logger.error(' Fatal error during server startup sequence:', error);
    await Database.disconnect();
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  // Stop background scheduler
  NotificationScheduler.stop();

  if (server) {
    await new Promise<void>((resolve) => {
      server!.close(() => {
        logger.info('HTTP server closed.');
        resolve();
      });
    });
  }

  await Database.disconnect();
  logger.info('Graceful shutdown completed successfully. Exiting.');
  process.exit(0);
};

// Process Termination Signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Uncaught Exception and Unhandled Rejection Handlers
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Promise Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

// Launch server
startServer();
