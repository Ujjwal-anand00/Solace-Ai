import { Response } from 'express';
import { ApiResponse } from '@solace/shared';

export class ApiResponseUtil {
  public static success<T>(res: Response, message: string, data?: T, statusCode = 200): Response {
    const payload: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  public static error(
    res: Response,
    message: string,
    statusCode = 500,
    errorCode = 'INTERNAL_SERVER_ERROR',
    details?: unknown,
  ): Response {
    const payload: ApiResponse = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      error: {
        code: errorCode,
        message,
        details,
      },
    };
    return res.status(statusCode).json(payload);
  }
}
