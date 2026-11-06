import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../../validators/auth.validator';
import {
  createJournalSchema,
  updateJournalSchema,
  journalQuerySchema,
  calendarQuerySchema,
  requestInsightSchema,
} from './journal.validator';
import { JournalController } from './journal.controller';

const router = Router();

// Private: All journal operations require authentication
router.use(requireAuth);

// Static sub-routes must be registered BEFORE parametrized /:id routes
router.get('/prompts', JournalController.getPrompts);
router.get('/prompts/random', JournalController.getRandomPrompt);
router.get('/stats', JournalController.getStats);
router.get('/calendar', validateQuery(calendarQuerySchema), JournalController.getCalendar);

// Collection CRUD
router.post('/', validateBody(createJournalSchema), JournalController.create);
router.get('/', validateQuery(journalQuerySchema), JournalController.list);

// Resource operations by ID
router.get('/:id', JournalController.getById);
router.patch('/:id', validateBody(updateJournalSchema), JournalController.update);
router.delete('/:id', JournalController.delete);
router.post('/:id/favorite', JournalController.toggleFavorite);
router.post('/:id/insight', validateBody(requestInsightSchema), JournalController.requestInsight);

export const journalRoutes = router;
