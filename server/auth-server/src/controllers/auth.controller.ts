/**
 * Handles HTTP request/response for authentication endpoints.
 */

import { Request, Response } from 'express';
import { login } from '../services/auth.service.js';
import { LoginRequest } from '../types/api.js';
import { logAuthEvent, extractIpAddress } from '../../../src/services/logging.service.js';

/**
 * POST /login
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
