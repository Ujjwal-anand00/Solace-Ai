import { Router } from 'express';
import { validateQuery } from '../../validators/auth.validator';
import { affirmationQuerySchema } from './affirmation.validator';
import { AffirmationController } from './affirmation.controller';

const router = Router();

router.get('/', validateQuery(affirmationQuerySchema), AffirmationController.list);
router.get('/daily', AffirmationController.daily);

export const affirmationRoutes = router;

