/**
 * Log Controller
 * 
 * Handles HTTP request/response for log endpoints.
 * Admin-only operations.
 * No business logic - delegates to log service.
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
import { getPaginatedLogs } from '../services/log.service.js';

/**
 * GET /api/logs
 * Get logs (admin only) with pagination
 * Query params: page, pageSize
 */
export async function getLogsController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const pageParam = req.query.page as string | undefined;
    const pageSizeParam = req.query.pageSize as string | undefined;

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 25;

    if (Number.isNaN(page) || page < 1) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Page must be a number greater than 0',
      });
      return;
    }

    if (Number.isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Page size must be a number between 1 and 100',
      });
      return;
    }

    const result = await getPaginatedLogs(page, pageSize);
    res.json(result);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching logs',
    });
  }
}
