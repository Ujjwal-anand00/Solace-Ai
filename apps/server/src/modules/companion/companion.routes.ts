import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validateBody } from '../../validators/auth.validator';
import { updateCompanionSettingsSchema } from './companion.validator';
import { CompanionController } from './companion.controller';

const router = Router();

// Private: All companion routes require authentication
router.use(requireAuth);

router.get('/settings', CompanionController.getSettings);
router.patch('/settings', validateBody(updateCompanionSettingsSchema), CompanionController.updateSettings);

export const companionRoutes = router;
