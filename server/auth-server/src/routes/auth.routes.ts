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
 * 
 * Note: This is the Authentication Server - it only handles login.
 *       All other auth endpoints (logout, /me) are handled by Backend API.
 */

import { Router } from 'express';
import { loginController } from '../controllers/auth.controller.js';

const router = Router();

/**
 * POST /login
 * Public endpoint - no authentication required
 * 
 * Decision: Login endpoint on Authentication Server
 * Reason: Separates authentication concerns from API concerns.
 *         Authentication Server handles password verification and token generation.
 *         Backend API only verifies tokens.
 */
router.post('/login', loginController);

export default router;
