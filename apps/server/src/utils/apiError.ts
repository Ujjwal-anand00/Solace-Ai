import { ERROR_CODES, ErrorCode } from '@solace/shared';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    errorCode: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
    isOperational = true,
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(message: string, details?: unknown): AppError {
    return new AppError(message, 400, ERROR_CODES.BAD_REQUEST, true, details);
  }

  public static unauthorized(message = 'Unauthorized access'): AppError {
    return new AppError(message, 401, ERROR_CODES.UNAUTHORIZED);
  }

  public static forbidden(message = 'Forbidden resource'): AppError {
    return new AppError(message, 403, ERROR_CODES.FORBIDDEN);
  }

  public static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, 404, ERROR_CODES.NOT_FOUND);
  }

  public static conflict(message: string): AppError {
    return new AppError(message, 409, ERROR_CODES.CONFLICT);
  }

  public static validation(message = 'Validation failed', details?: unknown): AppError {
    return new AppError(message, 422, ERROR_CODES.VALIDATION_ERROR, true, details);
  }

  public static internal(message = 'Internal server error'): AppError {
    return new AppError(message, 500, ERROR_CODES.INTERNAL_SERVER_ERROR, false);
  }

  public static serviceUnavailable(message = 'Service temporarily unavailable', details?: unknown): AppError {
    return new AppError(message, 503, ERROR_CODES.SERVICE_UNAVAILABLE, true, details);
  }

  public static tooManyRequests(message = 'Rate limit exceeded', details?: unknown): AppError {
    return new AppError(message, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED, true, details);
  }
}
