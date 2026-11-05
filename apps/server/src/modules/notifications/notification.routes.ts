import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { NotificationController } from './notification.controller';

const router = Router();

router.use(requireAuth);

router.get('/unread-count', NotificationController.getUnreadCount);

export const notificationRoutes = router;

