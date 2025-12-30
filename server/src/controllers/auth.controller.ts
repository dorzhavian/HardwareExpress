/**
 * Authentication Controller
 * 
 * Handles HTTP request/response for authentication endpoints.
 * No business logic - delegates to auth service.
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
import { login, getCurrentUser } from '../services/auth.service.js';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { LoginRequest } from '../types/api.js';
import { logAuthEvent, extractIpAddress } from '../services/logging.service.js';

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * 
 * Decision: Return 401 for invalid credentials (not 404)
 * Reason: Security best practice - don't reveal if email exists.
 *         Same response for invalid email or password.
 * 
 * Alternative: Different responses for "email not found" vs "wrong password"
 * Rejected: Security vulnerability - reveals which emails exist in system.
 */
export async function loginController(req: Request, res: Response): Promise<void> {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required',
      });
      return;
    }

    // Authenticate
    const result = await login(email, password);
    if (!result) {
      // Log failed login attempt
      await logAuthEvent({
        user_id: null,
        user_role: null,
        action: 'login',
        status: 'failure',
        ip_address: extractIpAddress(req),
        description: `Failed login attempt for email: ${email}`,
      });

      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
      return;
    }

    // Log successful login
    await logAuthEvent({
      user_id: result.user.id,
      user_role: result.user.role,
      action: 'login',
      status: 'success',
      ip_address: extractIpAddress(req),
      description: `Successful login for user: ${result.user.email}`,
    });

    // Success
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during login',
    });
  }
}

/**
 * POST /api/auth/logout
 * Logout endpoint (stateless - no server-side action needed)
 * 
 * Decision: Stateless logout (no server-side token invalidation)
 * Reason: JWT is stateless - tokens are valid until expiration.
 *         Client removes token on logout. For token invalidation,
 *         we'd need a token blacklist (future enhancement if needed).
 * 
 * Alternative: Token blacklist/revocation
 * Rejected: Requires additional storage (Redis/DB), adds complexity.
 *           Not needed for Phase 2. Can be added later if required.
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

  // Stateless logout - client removes token
  // In future, could add token blacklist here if needed
  res.json({
    message: 'Logged out successfully',
  });
}

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Requires authentication middleware
 * 
 * Decision: Separate endpoint for current user
 * Reason: Allows frontend to verify token and get user data.
 *         Useful for page refreshes and token validation.
 * 
 * Alternative: Include user in every authenticated response
 * Rejected: Not all endpoints need user data, adds unnecessary overhead.
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

