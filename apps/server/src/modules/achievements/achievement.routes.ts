import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { AchievementController } from './achievement.controller';

const router = Router();

router.use(requireAuth);

router.get('/', AchievementController.getAll);
router.get('/mine', AchievementController.getMine);
router.get('/:id', AchievementController.getById);

export const achievementRoutes = router;

