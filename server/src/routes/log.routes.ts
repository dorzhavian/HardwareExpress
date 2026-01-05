/**
 * Log Routes
 * 
 * Decision: Admin-only routes
 * Reason: Logs contain sensitive system activity and user metadata.
 * 
 * Alternative: Allow managers or employees
 * Rejected: Overexposes audit data, violates least privilege.
 */

import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/rbac.middleware.js';
import { getLogsController } from '../controllers/log.controller.js';

const router = Router();

// Admin-only logs endpoint
router.get('/', authenticate, requireAdmin, getLogsController);

export default router;
