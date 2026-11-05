import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { WellnessPlanController } from './wellnessPlan.controller';

const router = Router();

router.use(requireAuth);

router.get('/current', WellnessPlanController.getCurrent);

export const wellnessPlanRoutes = router;

