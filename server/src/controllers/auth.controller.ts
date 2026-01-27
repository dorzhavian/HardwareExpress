/**
 * Handles HTTP request/response for authentication endpoints.
 */

import { Response } from 'express';
import { getCurrentUser } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { logAuthEvent, extractIpAddress } from '../services/logging.service.js';

/**
 * POST /api/auth/logout
 */
export async function logoutController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  // Log logout if user is authenticated
  if (req.user) {
    await logAuthEvent({
      user_id: req.user.user_id,
      user_role: req.user.role,
      action: 'logout',
      status: 'success',
      ip_address: extractIpAddress(req),
      description: `User logged out`,
    });
  }

  res.json({
    message: 'Logged out successfully',
  });
}

/**
 * GET /api/auth/me
 * Requires authentication middleware
 */
export async function getMeController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    const user = await getCurrentUser(req.user.user_id);
    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching user data',
    });
  }
}

