import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponseUtil } from '../utils/apiResponse';
import { AppError } from '../utils/apiError';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const meta = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.socket.remoteAddress,
      };

      const result = await AuthService.register(req.body, meta);
      ApiResponseUtil.success(res, 'Account created successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const meta = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.socket.remoteAddress,
      };

      const result = await AuthService.login(req.body, meta);
      ApiResponseUtil.success(res, 'Signed in successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  public static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const meta = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.socket.remoteAddress,
      };

      const result = await AuthService.refreshTokens(req.body, meta);
      ApiResponseUtil.success(res, 'Token refreshed successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      ApiResponseUtil.success(res, 'Logged out successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   */
  public static async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await AuthService.forgotPassword(req.body);
      // Generic success response to avoid account enumeration
      ApiResponseUtil.success(
        res,
        'If an account exists with this email address, password reset instructions have been dispatched.',
        null,
        200,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   */
  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthService.resetPassword(req.body);
      ApiResponseUtil.success(
        res,
        'Password has been reset successfully. You may now sign in with your new password.',
        null,
        200,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  public static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }

      const profile = await AuthService.getProfile(req.user.id);
      ApiResponseUtil.success(res, 'Profile retrieved successfully', profile, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/auth/me
   */
  public static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }

      const profile = await AuthService.updateProfile(req.user.id, req.body);
      ApiResponseUtil.success(res, 'Profile updated successfully', profile, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/auth/me
   */
  public static async deleteMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }

      await AuthService.deleteAccount(req.user.id);
      ApiResponseUtil.success(res, 'Account and sessions deleted successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }
}
