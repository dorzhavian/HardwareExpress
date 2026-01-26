/**
 * Authentication Routes
 * 
 * Route definitions for authentication endpoints.
 * 
 * Decision: Separate route files by resource
 * Reason: Better organization, easier to maintain,
 *         follows RESTful API structure.
 * 
 * Alternative: All routes in single file
 * Rejected: Becomes unmaintainable as API grows,
 *           violates separation of concerns.
 */

import { Router } from 'express';
import {
  loginController,
  logoutController,
  getMeController,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * POST /api/auth/login
 * Public endpoint - no authentication required
 */
router.post('/login', loginController);

/**
 * POST /api/auth/logout
 * Protected endpoint - requires authentication for audit logging
 * 
 * Decision: Require authentication on logout
 * Reason: Audit logs need user context (user_id/role) for logout events.
 * Alternative: Keep logout public and skip logging
 * Rejected: Violates audit logging completeness for auth events.
 */
router.post('/logout', authenticate, logoutController);

/**
 * GET /api/auth/me
 * Protected endpoint - requires authentication
 * 
 * Decision: Using authenticate middleware
 * Reason: Reusable middleware, clean route definition.
 * 
 * Alternative: JWT verification in controller
 * Rejected: Code duplication, violates DRY principle.
 */
router.get('/me', authenticate, getMeController);

export default router;




