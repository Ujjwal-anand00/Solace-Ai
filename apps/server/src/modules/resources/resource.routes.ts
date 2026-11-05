import { Router } from 'express';
import { ResourceController } from './resource.controller';

const router = Router();

router.get('/', ResourceController.list);

export const resourceRoutes = router;

