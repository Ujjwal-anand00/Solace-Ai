import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { AssessmentController } from './assessment.controller';

const router = Router();

router.use(requireAuth);

router.get('/types', AssessmentController.getTypes);
router.get('/types/:type', AssessmentController.getTypeDetail);
router.get('/history', AssessmentController.getHistory);
router.get('/:type/latest', AssessmentController.getLatest);
router.post('/:type/submit', AssessmentController.submit);
router.get('/', AssessmentController.getHistory);
router.get('/:id', AssessmentController.getById);

export const assessmentRoutes = router;

