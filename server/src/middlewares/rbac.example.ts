/**
 * RBAC Middleware Usage Examples
 * 
 * This file demonstrates how to use RBAC middleware in routes.
 * This is for documentation purposes only - not imported in production code.
 * 
 * IMPORTANT: Always use authenticate middleware BEFORE RBAC middleware
 * because RBAC middleware relies on req.user set by authenticate middleware.
 */

import { Router } from 'express';
import { authenticate } from './auth.middleware.js';
import {
  requireAdmin,
  requireManagerOrAdmin,
  requireRole,
  requireAnyRole,
  requireAuthenticated,
} from './rbac.middleware.js';

const router = Router();

// Example 1: Admin-only route
router.get(
  '/admin/users',
  authenticate,        // First: verify JWT token
  requireAdmin,        // Then: check if user is admin
  (req, res) => {
    // Controller logic here
    // req.user is guaranteed to exist and be admin
  }
);

// Example 2: Manager or Admin route
router.get(
  '/orders',
  authenticate,
  requireManagerOrAdmin,  // Allows both admin and procurement_manager
  (req, res) => {
    // Controller logic here
    // req.user.role is either 'admin' or 'procurement_manager'
  }
);

// Example 3: Specific role requirement
router.post(
  '/equipment',
  authenticate,
  requireRole('procurement_manager'),  // Only procurement_manager
  (req, res) => {
    // Controller logic here
  }
);

// Example 4: Multiple roles (any of them)
router.get(
  '/reports',
  authenticate,
  requireAnyRole('admin', 'procurement_manager'),  // Admin OR manager
  (req, res) => {
    // Controller logic here
  }
);

// Example 5: Any authenticated user (no specific role required)
router.get(
  '/profile',
  authenticate,
  requireAuthenticated,  // Just needs to be logged in
  (req, res) => {
    // Controller logic here
    // req.user exists but role can be any of: admin, procurement_manager, employee
  }
);

// Example 6: Employee-only route
router.get(
  '/my-orders',
  authenticate,
  requireRole('employee'),  // Only employees
  (req, res) => {
    // Controller logic here
  }
);

export default router;

