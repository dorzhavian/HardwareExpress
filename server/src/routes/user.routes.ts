/**
 * User Routes
 * 
 * Route definitions for user management endpoints.
 * Admin-only operations.
 * 
 * Decision: Admin-only routes
 * Reason: User management is sensitive operation, should be restricted to admins only.
 * 
 * Alternative: Allow managers to manage users
 * Rejected: User management is admin-only responsibility for security and control.
 */

import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/rbac.middleware.js';
import {
  getAllUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController,
} from '../controllers/user.controller.js';

const router = Router();

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  getAllUsersController
);

/**
 * GET /api/users/:userId
 * Get user by ID (admin only)
 */
router.get(
  '/:userId',
  authenticate,
  requireAdmin,
  getUserByIdController
);

/**
 * POST /api/users
 * Create a new user (admin only)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  createUserController
);

/**
 * PATCH /api/users/:userId
 * Update user (admin only)
 */
router.patch(
  '/:userId',
  authenticate,
  requireAdmin,
  updateUserController
);

/**
 * DELETE /api/users/:userId
 * Delete user (admin only)
 */
router.delete(
  '/:userId',
  authenticate,
  requireAdmin,
  deleteUserController
);

export default router;



