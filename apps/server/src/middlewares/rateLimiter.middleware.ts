import rateLimit from 'express-rate-limit';
import { ApiResponseUtil } from '../utils/apiResponse';
import { ERROR_CODES } from '@solace/shared';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponseUtil.error(
      res,
      'Too many requests from this IP, please try again after 15 minutes',
      429,
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
    );
  },
});
