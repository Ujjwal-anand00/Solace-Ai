import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../../validators/auth.validator';
import {
  createMoodSchema,
  updateMoodSchema,
  moodQuerySchema,
  calendarQuerySchema,
  insightsQuerySchema,
} from './mood.validator';
import { MoodController } from './mood.controller';

const router = Router();

// All mood routes require authentication
router.use(requireAuth);

router.post('/', validateBody(createMoodSchema), MoodController.create);
router.get('/', validateQuery(moodQuerySchema), MoodController.list);
router.get('/summary', MoodController.summary);
router.get('/calendar', validateQuery(calendarQuerySchema), MoodController.calendar);
router.get('/insights', validateQuery(insightsQuerySchema), MoodController.insights);
router.get('/:id', MoodController.getById);
router.patch('/:id', validateBody(updateMoodSchema), MoodController.update);
router.delete('/:id', MoodController.delete);

export const moodRoutes = router;
