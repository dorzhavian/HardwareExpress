/**
 * Route definitions for user management endpoints.
 * Admin-only operations.

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
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  getAllUsersController
);

/**
 * GET /api/users/:userId
 */
router.get(
  '/:userId',
  authenticate,
  requireAdmin,
  getUserByIdController
);

/**
 * POST /api/users
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  createUserController
);

/**
 * PATCH /api/users/:userId
 */
router.patch(
  '/:userId',
  authenticate,
  requireAdmin,
  updateUserController
);

/**
 * DELETE /api/users/:userId
 */
router.delete(
  '/:userId',
  authenticate,
  requireAdmin,
  deleteUserController
);

export default router;




