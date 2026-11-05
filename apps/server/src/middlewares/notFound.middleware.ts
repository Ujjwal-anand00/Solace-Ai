import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/apiError';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(AppError.notFound(`Endpoint not found: ${req.method} ${req.originalUrl}`));
};
