import { Router } from 'express';
import { healthRoutes } from './health.routes';

const router = Router();

// Mount Health Routes
router.use('/', healthRoutes);

export const v1Routes = router;
