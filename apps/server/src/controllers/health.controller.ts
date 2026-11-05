import { Request, Response } from 'express';
import { env } from '../config/env';
import { HealthCheckResponse } from '@solace/shared';

export const getHealth = (_req: Request, res: Response): void => {
  const responseData: HealthCheckResponse = {
    success: true,
    message: 'Solace AI API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  };

  res.status(200).json(responseData);
};
