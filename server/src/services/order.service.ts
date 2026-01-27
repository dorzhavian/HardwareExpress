import {
  getAllOrders,
  getOrdersByUserId,
  getOrderById,
  getOrderItems,
  createOrder as createOrderInDb,
  createOrderItems,
  updateOrderStatus as updateOrderStatusInDb,
} from '../repositories/order.repository.js';
import { getCatalogItemById } from '../repositories/catalog.repository.js';
import { findUserById } from '../repositories/user.repository.js';
import { OrderResponse, OrderItemResponse, CreateOrderRequest } from '../types/api.js';
import { OrderRow, OrderItemRow, OrderStatus } from '../types/database.js';
import { transformCatalogItemToResponse } from './catalog.service.js';

/**
 * Transform order item to API response
 * @param orderItem - Database order item row
 * @param equipment - Equipment data (from catalog)
 * @returns API order item response
 */
function transformOrderItemToResponse(
  orderItem: OrderItemRow,
  equipment: any
): OrderItemResponse {
  return {
    equipmentId: orderItem.item_id,
    equipment: equipment,
    quantity: orderItem.quantity,
    unitPrice: orderItem.price , 
  };
}

/**
 * Transform order to API response
 * @param order - Database order row
 * @param orderItems - Array of order item rows
 * @param userName - User's full name
 * @param department - User's department
 * @returns API order response
 */
async function transformOrderToResponse(
  order: OrderRow,
  orderItems: OrderItemRow[],
  userName: string,
  department: string | null
): Promise<OrderResponse> {
  // Fetch equipment data for each order item
  const itemsWithEquipment = await Promise.all(
    orderItems.map(async (item) => {
      const equipment = await getCatalogItemById(item.item_id);
      if (!equipment) {
        throw new Error(`Equipment item not found: ${item.item_id}`);
      }
      const equipmentResponse = transformCatalogItemToResponse(equipment);
      return transformOrderItemToResponse(item, equipmentResponse);
    })
  );

  return {
    id: order.order_id,
    userId: order.user_id || '',
    userName,
    department: department || '',
    items: itemsWithEquipment,
    totalAmount: order.total_price , 
    status: order.status || 'pending',
    justification: order.justify_msg || '',
    createdAt: order.created_at || new Date().toISOString(),
    updatedAt: order.created_at || new Date().toISOString(), // Use created_at as fallback
  };
}

/**
 * Get all orders
 * @returns Array of order responses
 */
export async function getAllOrdersService(): Promise<OrderResponse[]> {
  const orders = await getAllOrders();
  
  const orderResponses = await Promise.all(
    orders.map(async (order) => {
      const orderItems = await getOrderItems(order.order_id);
      
      // Get user data
      let userName = 'Unknown User';
      let department: string | null = null;
      if (order.user_id) {
        const user = await findUserById(order.user_id);
        if (user) {
          userName = user.full_name;
          department = user.department;
        }
      }

      return transformOrderToResponse(order, orderItems, userName, department);
    })
  );

  return orderResponses;
}

/**
 * Get orders by user ID
 * @param userId - User UUID
 * @returns Array of order responses
 */
export async function getOrdersByUserIdService(
  userId: string
): Promise<OrderResponse[]> {
  const orders = await getOrdersByUserId(userId);
  
  const orderResponses = await Promise.all(
    orders.map(async (order) => {
      const orderItems = await getOrderItems(order.order_id);
      
      // Get user data
      const user = await findUserById(userId);
      const userName = user?.full_name || 'Unknown User';
      const department = user?.department || null;

      return transformOrderToResponse(order, orderItems, userName, department);
    })
  );

  return orderResponses;
}

/**
 * Get order by ID
 * @param orderId - Order UUID
 * @returns Order response or null if not found
 */
export async function getOrderByIdService(
  orderId: string
): Promise<OrderResponse | null> {
  const order = await getOrderById(orderId);
  if (!order) {
    return null;
  }

  const orderItems = await getOrderItems(order.order_id);
  
  // Get user data
  let userName = 'Unknown User';
  let department: string | null = null;
  if (order.user_id) {
    const user = await findUserById(order.user_id);
    if (user) {
      userName = user.full_name;
      department = user.department;
    }
  }

  return transformOrderToResponse(order, orderItems, userName, department);
}

/**
 * Create a new order
 * @param userId - User UUID creating the order
 * @param request - Create order request
 * @returns Created order response
 */
export async function createOrderService(
  userId: string,
  request: CreateOrderRequest
): Promise<OrderResponse> {
  // Validate request
  if (!request.items || request.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  if (!request.justification || request.justification.trim().length === 0) {
    throw new Error('Order justification is required');
  }

  // Fetch equipment data and calculate total
  let totalPriceCents = 0;
  const orderItemsData = await Promise.all(
    request.items.map(async (item) => {
      const equipment = await getCatalogItemById(item.equipmentId);
      if (!equipment) {
        throw new Error(`Equipment item not found: ${item.equipmentId}`);
      }

      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for item ${item.equipmentId}`);
      }

      const itemTotalCents = equipment.price * item.quantity;
      totalPriceCents += itemTotalCents;

      return {
        item_id: equipment.item_id,
        item_name: equipment.item_name,
        quantity: item.quantity,
        price: equipment.price, // Price per unit in cents
        category: equipment.category,
      };
    })
  );

  // Create order
  const order = await createOrderInDb({
    user_id: userId,
    total_price: totalPriceCents,
    justify_msg: request.justification.trim(),
    status: 'pending',
  });

  // Create order items
  await createOrderItems(
    order.order_id,
    orderItemsData.map((item) => ({
      item_id: item.item_id,
      item_name: item.item_name,
      quantity: item.quantity,
      price: item.price,
      category: item.category,
    }))
  );

  // Return created order
  const orderItems = await getOrderItems(order.order_id);
  const user = await findUserById(userId);
  const userName = user?.full_name || 'Unknown User';
  const department = user?.department || null;

  return transformOrderToResponse(order, orderItems, userName, department);
}

/**
 * Update order status
 * @param orderId - Order UUID
 * @param status - New order status (must match database enum)
 * @returns Updated order response or null if not found
 */
export async function updateOrderStatusService(
  orderId: string,
  status: OrderStatus
): Promise<OrderResponse | null> {
  // Validate status matches database enum
  const validStatuses: OrderStatus[] = ['pending', 'approved', 'rejected', 'completed'];
  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid order status: ${status}. Valid statuses: ${validStatuses.join(', ')}`
    );
  }

  const order = await updateOrderStatusInDb(orderId, status);
  if (!order) {
    return null;
  }

  const orderItems = await getOrderItems(order.order_id);
  
  // Get user data
  let userName = 'Unknown User';
  let department: string | null = null;
  if (order.user_id) {
    const user = await findUserById(order.user_id);
    if (user) {
      userName = user.full_name;
      department = user.department;
    }
  }

  return transformOrderToResponse(order, orderItems, userName, department);
}




