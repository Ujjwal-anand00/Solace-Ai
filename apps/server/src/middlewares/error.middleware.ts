import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/apiError';
import { ApiResponseUtil } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { ERROR_CODES } from '@solace/shared';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    logger.warn(
      `Operational Error: ${err.message} [Code: ${err.errorCode}, Path: ${req.originalUrl}]`,
    );
    ApiResponseUtil.error(res, err.message, err.statusCode, err.errorCode, err.details);
    return;
  }

  // Handle unexpected or programming errors
  logger.error(`Unhandled Exception at ${req.method} ${req.originalUrl}:`, err);

  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal server error';

  const details = env.NODE_ENV === 'development' ? { stack: err.stack } : undefined;

  ApiResponseUtil.error(res, message, 500, ERROR_CODES.INTERNAL_SERVER_ERROR, details);
};
