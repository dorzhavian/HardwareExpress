/**
 * Order Routes
 * 
 * Route definitions for order endpoints.
 * 
 * Decision: Role-based access control
 * Reason: Different roles have different access levels:
 *         - All authenticated users can create orders
 *         - Employees can only view their own orders
 *         - Managers and admins can view all orders and update status
 * 
 * Alternative: All authenticated users see all orders
 * Rejected: Privacy and security concern - employees shouldn't see other employees' orders.
 */

import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireManagerOrAdmin, requireAuthenticated } from '../middlewares/rbac.middleware.js';
import {
  getAllOrdersController,
  getOrdersByUserIdController,
  getOrderByIdController,
  createOrderController,
  updateOrderStatusController,
} from '../controllers/order.controller.js';

const router = Router();

/**
 * GET /api/orders
 * Get all orders (managers and admins only)
 */
router.get(
  '/',
  authenticate,
  requireManagerOrAdmin,
  getAllOrdersController
);

/**
 * GET /api/orders/user/:userId
 * Get orders for a specific user
 * Employees can access their own orders, managers/admins can access any
 */
router.get(
  '/user/:userId',
  authenticate,
  requireAuthenticated,
  getOrdersByUserIdController
);

/**
 * GET /api/orders/:orderId
 * Get order by ID
 * Employees can only access their own orders
 */
router.get(
  '/:orderId',
  authenticate,
  requireAuthenticated,
  getOrderByIdController
);

/**
 * POST /api/orders
 * Create a new order (all authenticated users)
 */
router.post(
  '/',
  authenticate,
  requireAuthenticated,
  createOrderController
);

/**
 * PATCH /api/orders/:orderId/status
 * Update order status (managers and admins only)
 */
router.patch(
  '/:orderId/status',
  authenticate,
  requireManagerOrAdmin,
  updateOrderStatusController
);

export default router;




