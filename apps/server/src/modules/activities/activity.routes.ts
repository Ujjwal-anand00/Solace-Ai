import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../../validators/auth.validator';
import { completeActivitySchema, activityQuerySchema } from './activity.validator';
import { ActivityController } from './activity.controller';

const router = Router();

// Public list and item view
router.get('/', validateQuery(activityQuerySchema), ActivityController.list);
router.get('/completed/history', requireAuth, ActivityController.completedHistory);
router.get('/:id', ActivityController.getById);

// Completion requires authenticated user
router.post(
  '/:id/complete',
  requireAuth,
  validateBody(completeActivitySchema),
  ActivityController.complete,
);

export const activityRoutes = router;
