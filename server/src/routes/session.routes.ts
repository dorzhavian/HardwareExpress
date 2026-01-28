/**
 * Route definitions for authentication endpoints.
 */

import { Router } from 'express';
import {
  logoutController,
  getMeController,
} from '../controllers/session.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * POST /api/auth/logout
 * Protected endpoint - requires authentication for audit logging
 */
router.post('/logout', authenticate, logoutController);

/**
 * GET /api/auth/me
 * Protected endpoint - requires authentication
 */
router.get('/me', authenticate, getMeController);

export default router;




