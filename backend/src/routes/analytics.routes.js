import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';
import { authenticate, requireTenant, authorizeRoles } from '../middlewares/index.js';

const router = Router();

// All analytics require authenticated tenant session with admin privileges
router.use(authenticate, requireTenant, authorizeRoles('OWNER', 'ADMIN', 'SUPER_ADMIN'));

/**
 * @route GET /api/v1/analytics/dashboard
 * @desc Retrieve executive financial, project, task, and aging telemetry
 */
router.get('/dashboard', getDashboardAnalytics);

export default router;
