import { Router } from 'express';
import { healthRoutes } from './health.routes';
import { authRoutes } from './auth.routes';
import { moodRoutes } from '../modules/mood/mood.routes';
import { journalRoutes } from '../modules/journal/journal.routes';
import { activityRoutes } from '../modules/activities/activity.routes';
import { affirmationRoutes } from '../modules/affirmations/affirmation.routes';
import { progressRoutes } from '../modules/progress/progress.routes';
import { resourceRoutes } from '../modules/resources/resource.routes';
import { assessmentRoutes } from '../modules/assessments/assessment.routes';
import { wellnessPlanRoutes } from '../modules/wellness-plans/wellnessPlan.routes';
import { notificationRoutes } from '../modules/notifications/notification.routes';
import { companionRoutes } from '../modules/companion/companion.routes';
import { conversationRoutes } from '../modules/conversations/conversation.routes';

const router = Router();

// Mount Health Routes
router.use('/', healthRoutes);

// Mount Auth Routes (includes /me user profile)
router.use('/auth', authRoutes);

// Mount Feature Module Routes
router.use('/mood', moodRoutes);
router.use('/journal', journalRoutes);
router.use('/activities', activityRoutes);
router.use('/affirmations', affirmationRoutes);
router.use('/progress', progressRoutes);
router.use('/resources', resourceRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/wellness-plans', wellnessPlanRoutes);
router.use('/notifications', notificationRoutes);
router.use('/companion', companionRoutes);
router.use('/conversations', conversationRoutes);

export const v1Routes = router;
