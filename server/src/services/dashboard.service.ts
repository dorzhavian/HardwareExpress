import { getAllOrdersForDashboard, getRecentOrders } from '../repositories/dashboard.repository.js';
import { getAllOrdersService } from './order.service.js';
import { DashboardStatsResponse, OrderResponse } from '../types/api.js';

/**
 * Get dashboard statistics
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
  
  const totalSpent = totalSpentCents; 

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




