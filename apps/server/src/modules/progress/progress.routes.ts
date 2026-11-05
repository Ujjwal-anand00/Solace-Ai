import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { ProgressController } from './progress.controller';

const router = Router();

router.use(requireAuth);

router.get('/', ProgressController.getOverview);
router.get('/overview', ProgressController.getOverview);
router.get('/summary', ProgressController.getSummary);
router.get('/trends', ProgressController.getTrends);
router.get('/history', ProgressController.getHistory);
router.get('/streak', ProgressController.getStreak);
router.get('/reports/weekly', ProgressController.getWeeklyReport);
router.get('/reports/monthly', ProgressController.getMonthlyReport);

export const progressRoutes = router;
