import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { WellnessPlanController } from './wellnessPlan.controller';

const router = Router();

router.use(requireAuth);

router.get('/current', WellnessPlanController.getCurrent);
router.post('/generate', WellnessPlanController.generatePreview);
router.get('/recommendations', WellnessPlanController.getRecommendations);
router.get('/', WellnessPlanController.list);
router.post('/', WellnessPlanController.create);
router.get('/:id', WellnessPlanController.getById);
router.patch('/:id', WellnessPlanController.update);
router.post('/:id/tasks/:taskId/complete', WellnessPlanController.completeTask);
router.post('/:id/tasks/:taskId/skip', WellnessPlanController.skipTask);
router.post('/:id/pause', WellnessPlanController.pause);
router.post('/:id/resume', WellnessPlanController.resume);
router.delete('/:id', WellnessPlanController.delete);

export const wellnessPlanRoutes = router;
