import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { ProgressController } from './progress.controller';

const router = Router();

router.use(requireAuth);

router.get('/', ProgressController.get);
router.get('/history', ProgressController.history);

export const progressRoutes = router;
