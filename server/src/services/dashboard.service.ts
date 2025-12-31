/**
 * Dashboard Service
 * 
 * Business logic for dashboard aggregation operations.
 * Handles calculations and transformations for dashboard statistics.
 * 
 * Decision: Service layer for business logic
 * Reason: Separates business rules from controllers and repositories.
 *         Controllers handle HTTP, services handle business logic.
 * 
 * Alternative: Business logic in controllers
 * Rejected: Violates CURSOR_RULES.md requirement: "No business logic inside controllers"
 */

import { getAllOrdersForDashboard, getRecentOrders } from '../repositories/dashboard.repository.js';
import { getAllOrdersService } from './order.service.js';
import { DashboardStatsResponse, OrderResponse } from '../types/api.js';

/**
 * Get dashboard statistics
 * 
 * Decision: Calculate stats server-side from database
 * Reason: Ensures accuracy, single source of truth, handles all edge cases.
 * 
 * Alternative: Calculate stats client-side
 * Rejected: Less efficient, requires fetching all data, potential inconsistencies.
 * 
 * Decision: Hardcoded monthly budget (can be made configurable later)
 * Reason: Simple for Phase 4. Can be moved to database/config in future.
 * 
 * Alternative: Store monthly budget in database
 * Rejected: Adds complexity, not needed for Phase 4. Can be enhanced later.
 * 
 * @returns Dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const orders = await getAllOrdersForDashboard();

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const approvedOrders = orders.filter((o) => o.status === 'approved').length;
  
  // Calculate total spent from approved and completed orders
  const totalSpentCents = orders
    .filter((o) => o.status === 'approved' || o.status === 'completed')
    .reduce((sum, order) => sum + order.total_price, 0);
  
  const totalSpent = totalSpentCents / 100; // Convert cents to dollars

  // Hardcoded monthly budget (can be made configurable later)
  const monthlyBudget = 200000.0;

  return {
    totalOrders,
    pendingOrders,
    approvedOrders,
    totalSpent,
    monthlyBudget,
  };
}

/**
 * Get recent orders for dashboard
 * 
 * @param limit - Maximum number of orders to return (default: 5)
 * @returns Array of order responses
 */
export async function getRecentOrdersService(
  limit: number = 5
): Promise<OrderResponse[]> {
  // Get recent orders from repository
  const recentOrderRows = await getRecentOrders(limit);
  
  // Transform to full order responses using existing service
  // This ensures consistency with order endpoints
  const allOrders = await getAllOrdersService();
  
  // Filter to only recent orders and limit
  const recentOrderIds = new Set(recentOrderRows.map((o) => o.order_id));
  const recentOrders = allOrders
    .filter((o) => recentOrderIds.has(o.id))
    .slice(0, limit);

  return recentOrders;
}




