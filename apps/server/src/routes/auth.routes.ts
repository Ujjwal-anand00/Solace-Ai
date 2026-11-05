import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth, authRateLimiter } from '../middlewares';
import {
  validateBody,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators';

const router = Router();

// Public Authentication Endpoints
router.post('/register', authRateLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), AuthController.login);
router.post('/refresh', validateBody(refreshTokenSchema), AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post(
  '/forgot-password',
  authRateLimiter,
  validateBody(forgotPasswordSchema),
  AuthController.forgotPassword,
);
router.post(
  '/reset-password',
  authRateLimiter,
  validateBody(resetPasswordSchema),
  AuthController.resetPassword,
);

// Protected User Profile Endpoints
router.get('/me', requireAuth, AuthController.getMe);
router.patch('/me', requireAuth, validateBody(updateProfileSchema), AuthController.updateMe);
router.delete('/me', requireAuth, AuthController.deleteMe);

export const authRoutes = router;
