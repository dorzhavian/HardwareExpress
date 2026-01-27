/**
 * Centralized authorization middleware for role-based access control.
 * Uses roles exactly as defined in database ENUM: user_role_enum
 * Roles: 'admin' | 'procurement_manager' | 'employee'
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { UserRole } from '../types/database.js';

/**
 * Require a specific role
 * @param requiredRole - The role required to access the route
 * @returns Express middleware function
 */
export function requireRole(requiredRole: UserRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Ensure user is authenticated (should be called after authenticate middleware)
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Check if user has required role
    if (req.user.role !== requiredRole) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${requiredRole}`,
      });
      return;
    }

    next();
  };
}

/**
 * Require any of the specified roles
 * @param allowedRoles - Array of roles that can access the route
 * @returns Express middleware function
 */
export function requireAnyRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Ensure user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Check if user has any of the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

/**
 * Require admin role
 * Convenience middleware for admin-only routes
 */
export const requireAdmin = requireRole('admin');

/**
 * Require procurement manager or admin
 * Convenience middleware for routes accessible by managers and admins
 */
export const requireManagerOrAdmin = requireAnyRole('admin', 'procurement_manager');

/**
 * Require employee or higher (any authenticated user)
 * Convenience middleware for routes accessible by all authenticated users
 */
export function requireAuthenticated(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  // Any authenticated user can access
  next();
}




