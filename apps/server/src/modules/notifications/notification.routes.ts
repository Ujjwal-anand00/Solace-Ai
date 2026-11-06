import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { NotificationController } from './notification.controller';

const router = Router();

router.use(requireAuth);

// --- Devices ---
router.post('/devices/register', NotificationController.registerDevice);
router.delete('/devices/:id', NotificationController.removeDevice);

// --- Preferences ---
router.get('/preferences', NotificationController.getPreferences);
router.patch('/preferences', NotificationController.updatePreferences);

// --- Reminders ---
router.get('/reminders', NotificationController.getReminders);
router.post('/reminders', NotificationController.createReminder);
router.patch('/reminders/:id', NotificationController.updateReminder);
router.delete('/reminders/:id', NotificationController.deleteReminder);

// --- Inbox & Notifications ---
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);
router.get('/', NotificationController.getNotifications);

export const notificationRoutes = router;
