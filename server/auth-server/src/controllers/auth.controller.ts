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
 * 
 * Note: This is the Authentication Server - it only handles login.
 *       Logout and /me endpoints are handled by Backend API.
 *       Uses shared logging service from Backend API for AI analysis.
 */

import { Request, Response } from 'express';
import { login } from '../services/auth.service.js';
import { LoginRequest } from '../types/api.js';
import { logAuthEvent, extractIpAddress } from '../../../src/services/logging.service.js';

/**
 * POST /login
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
      // Log failed login attempt (uses shared logging service with AI analysis)
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

    // Log successful login (uses shared logging service with AI analysis)
    await logAuthEvent({
      user_id: result.user.id,
      user_role: result.user.role,
      action: 'login',
      status: 'success',
      ip_address: extractIpAddress(req),
      description: `Successful login for user: ${result.user.email}`,
    });

    // Success - return token and user data
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during login',
    });
  }
}
