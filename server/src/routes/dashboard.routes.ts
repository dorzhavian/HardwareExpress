/**
 * Route definitions for dashboard endpoints.
 */

import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAuthenticated } from '../middlewares/rbac.middleware.js';
import {
  getDashboardStatsController,
  getRecentOrdersController,
} from '../controllers/dashboard.controller.js';

const router = Router();

/**
 * GET /api/dashboard/stats
 */
router.get(
  '/stats',
  authenticate,
  requireAuthenticated,
  getDashboardStatsController
);

/**
 * GET /api/dashboard/recent-orders
 */
router.get(
  '/recent-orders',
  authenticate,
  requireAuthenticated,
  getRecentOrdersController
);

export default router;




