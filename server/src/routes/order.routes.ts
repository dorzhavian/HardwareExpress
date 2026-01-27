/**
 * Route definitions for order endpoints.
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
 */
router.get(
  '/',
  authenticate,
  requireManagerOrAdmin,
  getAllOrdersController
);

/**
 * GET /api/orders/user/:userId
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
 */
router.post(
  '/',
  authenticate,
  requireAuthenticated,
  createOrderController
);

/**
 * PATCH /api/orders/:orderId/status
 */
router.patch(
  '/:orderId/status',
  authenticate,
  requireManagerOrAdmin,
  updateOrderStatusController
);

export default router;




