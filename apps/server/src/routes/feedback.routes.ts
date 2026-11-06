import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../validators/auth.validator';
import { feedbackSchema } from '../modules/users/user.validator';
import { UserController } from '../modules/users/user.controller';

const router = Router();

router.use(requireAuth);
router.post('/', validateBody(feedbackSchema), UserController.submitFeedback);

export const feedbackRoutes = router;

