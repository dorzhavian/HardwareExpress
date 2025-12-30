/**
 * Dashboard Routes
 * 
 * Route definitions for dashboard endpoints.
 * 
 * Decision: Authenticated routes (any authenticated user)
 * Reason: Dashboard data should be accessible to all authenticated users.
 *         Different roles may see different data (handled in service layer if needed).
 * 
 * Alternative: Role-specific dashboard routes
 * Rejected: Over-complicates for Phase 4. Can be enhanced later if needed.
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
 * Get dashboard statistics
 */
router.get(
  '/stats',
  authenticate,
  requireAuthenticated,
  getDashboardStatsController
);

/**
 * GET /api/dashboard/recent-orders
 * Get recent orders for dashboard
 * Query param: limit (optional, default: 5)
 */
router.get(
  '/recent-orders',
  authenticate,
  requireAuthenticated,
  getRecentOrdersController
);

export default router;

