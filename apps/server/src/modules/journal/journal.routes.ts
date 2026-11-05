import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../../validators/auth.validator';
import { createJournalSchema, updateJournalSchema, journalQuerySchema } from './journal.validator';
import { JournalController } from './journal.controller';

const router = Router();

// Private: All journal operations require authentication
router.use(requireAuth);

router.post('/', validateBody(createJournalSchema), JournalController.create);
router.get('/', validateQuery(journalQuerySchema), JournalController.list);
router.get('/:id', JournalController.getById);
router.patch('/:id', validateBody(updateJournalSchema), JournalController.update);
router.delete('/:id', JournalController.delete);

export const journalRoutes = router;
