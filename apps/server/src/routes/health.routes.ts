import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    API Health Check
 * @access  Public
 */
router.get('/health', getHealth);

export const healthRoutes = router;
