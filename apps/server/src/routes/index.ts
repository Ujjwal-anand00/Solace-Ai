import { Router } from 'express';
import { healthRoutes } from './health.routes';
import { authRoutes } from './auth.routes';

const router = Router();

// Mount Health Routes
router.use('/', healthRoutes);

// Mount Auth Routes
router.use('/auth', authRoutes);

export const v1Routes = router;
