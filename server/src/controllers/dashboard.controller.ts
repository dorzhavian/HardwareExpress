/**
 * Dashboard Controller
 * 
 * Handles HTTP request/response for dashboard endpoints.
 * No business logic - delegates to dashboard service.
 * 
 * Decision: Controllers handle only HTTP concerns
 * Reason: Follows CURSOR_RULES.md: "No business logic inside controllers"
 *         Controllers = request/response handling only.
 * 
 * Alternative: Business logic in controllers
 * Rejected: Violates separation of concerns, harder to test,
 *           doesn't follow project architecture rules.
 */

import { Request, Response } from 'express';
import { getDashboardStats, getRecentOrdersService } from '../services/dashboard.service.js';

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
export async function getDashboardStatsController(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching dashboard statistics',
    });
  }
}

/**
 * GET /api/dashboard/recent-orders
 * Get recent orders for dashboard
 * Query param: limit (optional, default: 5)
 */
export async function getRecentOrdersController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const limitParam = req.query.limit;
    const limit = limitParam ? parseInt(limitParam as string, 10) : 5;

    if (isNaN(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Limit must be a number between 1 and 100',
      });
      return;
    }

    const orders = await getRecentOrdersService(limit);
    res.json(orders);
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching recent orders',
    });
  }
}



