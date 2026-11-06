import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { UserService } from './user.service';
import { ApiResponseUtil } from '../../utils';

export class UserController {
  public static async getMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const profile = await UserService.getProfile(req.user!.id);
      ApiResponseUtil.success(res, 'User profile retrieved successfully', profile);
    } catch (err) {
      next(err);
    }
  }

  public static async updateMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const profile = await UserService.updateProfile(req.user!.id, req.body);
      ApiResponseUtil.success(res, 'Profile updated successfully', profile);
    } catch (err) {
      next(err);
    }
  }

  public static async updatePreferences(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const profile = await UserService.updatePreferences(req.user!.id, req.body);
      ApiResponseUtil.success(res, 'Preferences updated successfully', profile);
    } catch (err) {
      next(err);
    }
  }

  public static async uploadAvatar(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { avatarUrl } = req.body;
      const profile = await UserService.updateProfile(req.user!.id, { avatarUrl });
      ApiResponseUtil.success(res, 'Avatar updated successfully', profile);
    } catch (err) {
      next(err);
    }
  }

  public static async removeAvatar(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const profile = await UserService.removeAvatar(req.user!.id);
      ApiResponseUtil.success(res, 'Avatar removed successfully', profile);
    } catch (err) {
      next(err);
    }
  }

  public static async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await UserService.changePassword(req.user!.id, req.body);
      ApiResponseUtil.success(res, 'Password changed successfully', null);
    } catch (err) {
      next(err);
    }
  }

  public static async getSessions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const sessions = await UserService.getSessions(req.user!.id);
      ApiResponseUtil.success(res, 'User sessions retrieved successfully', sessions);
    } catch (err) {
      next(err);
    }
  }

  public static async revokeSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await UserService.revokeSession(req.user!.id, req.params.id);
      ApiResponseUtil.success(res, 'Session revoked successfully', null);
    } catch (err) {
      next(err);
    }
  }

  public static async logoutAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await UserService.logoutAll(req.user!.id);
      ApiResponseUtil.success(res, 'All other sessions revoked successfully', null);
    } catch (err) {
      next(err);
    }
  }

  public static async generateDataExport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const exportData = await UserService.generateDataExport(req.user!.id);
      ApiResponseUtil.success(res, 'Data export generated successfully', exportData);
    } catch (err) {
      next(err);
    }
  }

  public static async getDataExport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const exportData = await UserService.getExportById(req.user!.id, req.params.id);
      ApiResponseUtil.success(res, 'Data export retrieved successfully', exportData);
    } catch (err) {
      next(err);
    }
  }

  public static async submitFeedback(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await UserService.submitFeedback(req.user!.id, req.body);
      ApiResponseUtil.success(res, 'Feedback submitted successfully. Thank you!', null, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async deleteAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await UserService.deleteAccount(req.user!.id);
      ApiResponseUtil.success(res, 'Account and associated data deleted permanently', null);
    } catch (err) {
      next(err);
    }
  }
}

