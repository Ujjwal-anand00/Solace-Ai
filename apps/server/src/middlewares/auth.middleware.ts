import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/apiError';
import { User } from '../models/user.model';

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = AuthService.verifyAccessToken(token);

    // Verify user is active in database
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw AppError.unauthorized('User not found or account deactivated');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = AuthService.verifyAccessToken(token);
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = {
            id: user._id.toString(),
            email: user.email,
          };
        }
      } catch {
        // Token invalid or expired, continue as guest
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};


