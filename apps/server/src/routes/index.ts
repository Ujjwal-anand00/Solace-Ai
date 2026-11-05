import { Router } from 'express';
import { healthRoutes } from './health.routes';
import { authRoutes } from './auth.routes';
import { moodRoutes } from '../modules/mood/mood.routes';
import { journalRoutes } from '../modules/journal/journal.routes';
import { activityRoutes } from '../modules/activities/activity.routes';
import { affirmationRoutes } from '../modules/affirmations/affirmation.routes';
import { progressRoutes } from '../modules/progress/progress.routes';

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

export const v1Routes = router;
