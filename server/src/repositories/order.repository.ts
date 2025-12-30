/**
 * Order Repository
 * 
 * Database access layer for orders and order_items tables.
 * Contains only database queries, no business logic.
 * 
 * Decision: Repository pattern for database access
 * Reason: Separates data access from business logic, makes testing easier,
 *         allows swapping database implementations if needed.
 * 
 * Alternative: Direct database calls in services
 * Rejected: Violates separation of concerns, makes testing harder,
 *           doesn't follow CURSOR_RULES.md architecture.
 */

import { database } from '../config/database.js';
import { OrderRow, OrderItemRow, OrderStatus } from '../types/database.js';

/**
 * Get all orders
 * 
 * @returns Array of order rows
 */
export async function getAllOrders(): Promise<OrderRow[]> {
  const { data, error } = await database
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return (data || []) as OrderRow[];
}

/**
 * Get orders by user ID
 * 
 * @param userId - User UUID
 * @returns Array of order rows
 */
export async function getOrdersByUserId(userId: string): Promise<OrderRow[]> {
  const { data, error } = await database
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user orders: ${error.message}`);
  }

  return (data || []) as OrderRow[];
}

/**
 * Get order by ID
 * 
 * @param orderId - Order UUID
 * @returns Order row or null if not found
 */
export async function getOrderById(orderId: string): Promise<OrderRow | null> {
  const { data, error } = await database
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch order: ${error.message}`);
  }

  return data as OrderRow;
}

/**
 * Get order items for an order
 * 
 * @param orderId - Order UUID
 * @returns Array of order item rows
 */
export async function getOrderItems(orderId: string): Promise<OrderItemRow[]> {
  const { data, error } = await database
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) {
    throw new Error(`Failed to fetch order items: ${error.message}`);
  }

  return (data || []) as OrderItemRow[];
}

/**
 * Create a new order
 * 
 * Decision: Transaction-like approach with separate inserts
 * Reason: Supabase doesn't support explicit transactions in this context.
 *         We insert order first, then order items. If items fail, order remains
 *         but can be cleaned up. For Phase 4, this is acceptable.
 * 
 * Alternative: Use PostgreSQL transactions via raw SQL
 * Rejected: More complex, requires raw SQL, Supabase client handles this well enough.
 * 
 * @param order - Order data
 * @returns Created order row
 */
export async function createOrder(order: {
  user_id: string;
  total_price: number;
  justify_msg: string;
  status: OrderStatus;
}): Promise<OrderRow> {
  const { data, error } = await database
    .from('orders')
    .insert({
      user_id: order.user_id,
      total_price: order.total_price,
      justify_msg: order.justify_msg,
      status: order.status,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return data as OrderRow;
}

/**
 * Create order items for an order
 * 
 * @param orderId - Order UUID
 * @param items - Array of order item data
 */
export async function createOrderItems(
  orderId: string,
  items: Array<{
    item_id: string;
    item_name: string;
    quantity: number;
    price: number;
    category: string | null;
  }>
): Promise<void> {
  const orderItems = items.map((item) => ({
    order_id: orderId,
    item_id: item.item_id,
    item_name: item.item_name,
    quantity: item.quantity,
    price: item.price,
    category: item.category,
  }));

  const { error } = await database.from('order_items').insert(orderItems);

  if (error) {
    throw new Error(`Failed to create order items: ${error.message}`);
  }
}

/**
 * Update order status
 * 
 * @param orderId - Order UUID
 * @param status - New order status
 * @returns Updated order row or null if not found
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<OrderRow | null> {
  const { data, error } = await database
    .from('orders')
    .update({ status })
    .eq('order_id', orderId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to update order status: ${error.message}`);
  }

  return data as OrderRow;
}

