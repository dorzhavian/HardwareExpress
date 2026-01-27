/**
 * Authentication Middleware
 * 
 * Verifies JWT token from Authorization header.
 * Extracts user_id and role from token and attaches to request.
 * 
 * Decision: Middleware for JWT verification
 * Reason: Reusable across multiple routes, clean separation of concerns.
 *         Follows Express.js middleware pattern.
 * 
 * Alternative: JWT verification in each controller
 * Rejected: Code duplication, harder to maintain, violates DRY principle.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../services/jwt.service.js';
import { JWTPayload } from '../types/api.js';

/**
 * Extend Express Request to include user info from JWT
 */
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 * 
 * Decision: Stateless authentication (JWT only)
 * Reason: Scalable, no server-side session storage needed,
 *         works well with load balancing.
 * 
 * Alternative: Session-based authentication
 * Rejected: Requires session storage (Redis/DB), more complex,
 *           doesn't scale as well horizontally.
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header',
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    console.error('JWT verification failed:', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20),
      hasJwtSecret: !!process.env.JWT_SECRET,
    });
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
    return;
  }

  // Attach user info to request for use in controllers
  req.user = payload;
  next();
}




