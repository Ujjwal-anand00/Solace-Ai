import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validateBody } from '../../validators/auth.validator';
import {
  updateMeSchema,
  updatePreferencesSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from './user.validator';
import { UserController } from './user.controller';

const router = Router();

// Private: All user profile routes require authentication
router.use(requireAuth);

router.get('/me', UserController.getMe);
router.patch('/me', validateBody(updateMeSchema), UserController.updateMe);
router.patch('/me/preferences', validateBody(updatePreferencesSchema), UserController.updatePreferences);
router.post('/me/avatar', UserController.uploadAvatar);
router.delete('/me/avatar', UserController.removeAvatar);

router.post('/me/change-password', validateBody(changePasswordSchema), UserController.changePassword);
router.get('/me/sessions', UserController.getSessions);
router.delete('/me/sessions/:id', UserController.revokeSession);
router.post('/me/logout-all', UserController.logoutAll);

router.post('/me/data-export', UserController.generateDataExport);
router.get('/me/data-export/:id', UserController.getDataExport);
router.delete('/me/account', validateBody(deleteAccountSchema), UserController.deleteAccount);

export const userRoutes = router;

