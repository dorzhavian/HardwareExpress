/**
 * Order Controller
 * 
 * Handles HTTP request/response for order endpoints.
 * No business logic - delegates to order service.
 * 
 * Decision: Controllers handle only HTTP concerns
 * Reason: Follows CURSOR_RULES.md: "No business logic inside controllers"
 *         Controllers = request/response handling only.
 * 
 * Alternative: Business logic in controllers
 * Rejected: Violates separation of concerns, harder to test,
 *           doesn't follow project architecture rules.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import {
  getAllOrdersService,
  getOrdersByUserIdService,
  getOrderByIdService,
  createOrderService,
  updateOrderStatusService,
} from '../services/order.service.js';
import { CreateOrderRequest, UpdateOrderStatusRequest } from '../types/api.js';
import { logCrudEvent, logApprovalEvent, extractIpAddress } from '../services/logging.service.js';

/**
 * GET /api/orders
 * Get all orders (managers and admins only)
 * Employees see only their own orders via getOrdersByUserId
 */
export async function getAllOrdersController(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const orders = await getAllOrdersService();
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching orders',
    });
  }
}

/**
 * GET /api/orders/user/:userId
 * Get orders for a specific user
 * Employees can only see their own orders
 */
export async function getOrdersByUserIdController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.user_id;

    if (!userId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'User ID is required',
      });
      return;
    }

    // Employees can only see their own orders
    if (req.user?.role === 'employee' && userId !== requestingUserId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own orders',
      });
      return;
    }

    const orders = await getOrdersByUserIdService(userId);
    res.json(orders);
  } catch (error) {
    console.error('Get orders by user ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching orders',
    });
  }
}

/**
 * GET /api/orders/:orderId
 * Get order by ID
 */
export async function getOrderByIdController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Order ID is required',
      });
      return;
    }

    const order = await getOrderByIdService(orderId);
    if (!order) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Order not found',
      });
      return;
    }

    // Employees can only see their own orders
    if (req.user?.role === 'employee' && order.userId !== req.user.user_id) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own orders',
      });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching order',
    });
  }
}

/**
 * POST /api/orders
 * Create a new order
 * All authenticated users can create orders
 */
export async function createOrderController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const request: CreateOrderRequest = req.body;

    // Validation
    if (!request.items || !Array.isArray(request.items) || request.items.length === 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Order must contain at least one item',
      });
      return;
    }

    if (!request.justification || typeof request.justification !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Order justification is required',
      });
      return;
    }

    const order = await createOrderService(req.user.user_id, request);
    
    // Log order creation
    await logCrudEvent({
      user_id: req.user.user_id,
      user_role: req.user.role,
      action: 'create',
      resource: 'order',
      status: 'success',
      ip_address: extractIpAddress(req),
      description: `Order created with ${order.items.length} item(s), total: $${order.totalAmount.toLocaleString()}`,
      resourceId: order.id,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    
    // Log failed order creation
    if (req.user) {
      await logCrudEvent({
        user_id: req.user.user_id,
        user_role: req.user.role,
        action: 'create',
        resource: 'order',
        status: 'failure',
        ip_address: extractIpAddress(req),
        description: `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    const statusCode = error instanceof Error && error.message.includes('not found')
      ? 404
      : error instanceof Error && error.message.includes('Invalid')
      ? 400
      : 500;
    res.status(statusCode).json({
      error: statusCode === 400 ? 'Bad Request' : statusCode === 404 ? 'Not Found' : 'Internal Server Error',
      message: error instanceof Error ? error.message : 'An error occurred while creating order',
    });
  }
}

/**
 * PATCH /api/orders/:orderId/status
 * Update order status (managers and admins only)
 */
export async function updateOrderStatusController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { orderId } = req.params;
  
  try {
    const request: UpdateOrderStatusRequest = req.body;

    if (!orderId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Order ID is required',
      });
      return;
    }

    if (!request.status) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Status is required',
      });
      return;
    }

    const order = await updateOrderStatusService(orderId, request.status);
    if (!order) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Order not found',
      });
      return;
    }

    // Log order status update
    // Use approval event for approve/reject, update event for other status changes
    if (request.status === 'approved' || request.status === 'rejected') {
      await logApprovalEvent({
        user_id: req.user?.user_id || null,
        user_role: req.user?.role || null,
        status: request.status === 'approved' ? 'success' : 'failure',
        ip_address: extractIpAddress(req),
        description: `Order ${request.status}`,
        orderId: order.id,
      });
    } else {
      await logCrudEvent({
        user_id: req.user?.user_id || null,
        user_role: req.user?.role || null,
        action: 'update',
        resource: 'order',
        status: 'success',
        ip_address: extractIpAddress(req),
        description: `Order status updated to: ${request.status}`,
        resourceId: order.id,
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    
    // Log failed status update
    if (req.user) {
      await logCrudEvent({
        user_id: req.user.user_id,
        user_role: req.user.role,
        action: 'update',
        resource: 'order',
        status: 'failure',
        ip_address: extractIpAddress(req),
        description: `Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        resourceId: orderId,
      });
    }

    const statusCode = error instanceof Error && error.message.includes('Invalid')
      ? 400
      : 500;
    res.status(statusCode).json({
      error: statusCode === 400 ? 'Bad Request' : 'Internal Server Error',
      message: error instanceof Error ? error.message : 'An error occurred while updating order status',
    });
  }
}

