import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ApiResponseUtil } from '../utils/apiResponse';
import { ERROR_CODES } from '@solace/shared';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  wellnessGoals: z.array(z.string()).optional(),
  onboardingCompleted: z.boolean().optional(),
  notificationPreferences: z
    .object({
      dailyCheckIn: z.boolean().optional(),
      mindfulBreaths: z.boolean().optional(),
      affirmations: z.boolean().optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  preferredName: z.string().trim().max(50).optional(),
  avatarUrl: z.string().trim().optional(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  wellnessGoals: z.array(z.string()).optional(),
  notificationPreferences: z
    .object({
      dailyCheckIn: z.boolean().optional(),
      mindfulBreaths: z.boolean().optional(),
      affirmations: z.boolean().optional(),
    })
    .optional(),
  themePreference: z.enum(['light', 'dark', 'system']).optional(),
});

/**
 * Higher-order middleware to validate incoming request body against a Zod schema
 */
export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        ApiResponseUtil.error(
          res,
          'Validation failed. Please check your input fields.',
          422,
          ERROR_CODES.VALIDATION_ERROR,
          issues,
        );
        return;
      }
      next(error);
    }
  };
};

