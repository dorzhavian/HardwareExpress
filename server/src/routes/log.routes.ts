import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/rbac.middleware.js';
import { getLogsController } from '../controllers/log.controller.js';

const router = Router();

// Admin-only logs endpoint
router.get('/', authenticate, requireAdmin, getLogsController);

export default router;
