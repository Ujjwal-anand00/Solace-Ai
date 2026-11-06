import { Router } from 'express';
import { ResourceController } from './resource.controller';
import { requireAuth, optionalAuth } from '../../middlewares';

const router = Router();

// Resource discovery & browsing
router.get('/', optionalAuth, ResourceController.list);
router.get('/featured', optionalAuth, ResourceController.getFeatured);
router.get('/recommended', optionalAuth, ResourceController.getRecommended);
router.get('/categories', ResourceController.getCategories);
router.get('/search', optionalAuth, ResourceController.search);

// User bookmarks & reading progress (must be before :id to avoid param capture)
router.get('/favorites', requireAuth, ResourceController.getFavorites);
router.get('/progress', requireAuth, ResourceController.getProgress);

// Single resource details
router.get('/:id', optionalAuth, ResourceController.getById);

// Resource interactions
router.post('/:id/favorite', requireAuth, ResourceController.toggleFavorite);
router.put('/:id/progress', requireAuth, ResourceController.updateProgress);
router.post('/:id/complete', requireAuth, ResourceController.complete);

export const resourceRoutes = router;

// Admin router for resource content management
const adminRouter = Router();
adminRouter.post('/', requireAuth, ResourceController.adminCreate);
adminRouter.put('/:id', requireAuth, ResourceController.adminUpdate);
adminRouter.delete('/:id', requireAuth, ResourceController.adminDelete);
adminRouter.patch('/:id/publish', requireAuth, ResourceController.adminPublish);
adminRouter.patch('/:id/feature', requireAuth, ResourceController.adminFeature);
adminRouter.post('/seed', requireAuth, ResourceController.adminSeed);

export const adminResourceRoutes = adminRouter;
