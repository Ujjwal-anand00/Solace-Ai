import { Request, Response } from 'express';
import { env } from '../config/env';
import { Database } from '../database';
import { ApiResponseUtil } from '../utils/apiResponse';

export const getHealth = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Solace AI API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: process.uptime(),
  });
};

export const getReadiness = (_req: Request, res: Response): void => {
  const dbStatus = Database.status;

  if (!dbStatus.isConnected) {
    ApiResponseUtil.error(
      res,
      'Database is not connected or not ready',
      503,
      'SERVICE_UNAVAILABLE',
      { database: dbStatus },
    );
    return;
  }

  ApiResponseUtil.success(
    res,
    'Solace AI API and database are fully operational',
    {
      status: 'ready',
      environment: env.NODE_ENV,
      database: 'connected',
      uptime: process.uptime(),
    },
    200,
  );
};
