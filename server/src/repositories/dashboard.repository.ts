/**
 * Dashboard Repository
 * 
 * Database access layer for dashboard aggregation queries.
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
import { OrderRow } from '../types/database.js';

/**
 * Get all orders for dashboard aggregation
 * 
 * @returns Array of order rows
 */
export async function getAllOrdersForDashboard(): Promise<OrderRow[]> {
  const { data, error } = await database
    .from('orders')
    .select('*')
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to fetch orders for dashboard: ${error.message}`);
  }

  return (data || []) as OrderRow[];
}

/**
 * Get recent orders
 * 
 * @param limit - Maximum number of orders to return
 * @returns Array of order rows
 */
export async function getRecentOrders(limit: number = 5): Promise<OrderRow[]> {
  const { data, error } = await database
    .from('orders')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent orders: ${error.message}`);
  }

  return (data || []) as OrderRow[];
}



