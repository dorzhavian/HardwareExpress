/**
 * RBAC (Role-Based Access Control) Middleware
 * 
 * Centralized authorization middleware for role-based access control.
 * Uses roles exactly as defined in database ENUM: user_role_enum
 * Roles: 'admin' | 'procurement_manager' | 'employee'
 * 
 * Decision: Centralized middleware-based RBAC
 * Reason: 
 * - Single source of truth for authorization logic
 * - Reusable across all routes
 * - No inline role checks in controllers (follows CURSOR_RULES.md)
 * - Easy to test and maintain
 * - Composable - can chain multiple role checks
 * 
 * Alternative: Inline role checks in controllers
 * Rejected: Violates CURSOR_RULES.md requirement: "No business logic inside controllers"
 *           Also violates DRY principle, harder to maintain and test.
 * 
 * Alternative: Decorator pattern or class-based authorization
 * Rejected: Over-engineered for Express.js, adds complexity without benefit.
 *           Middleware pattern is idiomatic Express.js and sufficient.
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { UserRole } from '../types/database.js';

/**
 * Require a specific role
 * 
 * Decision: Function factory pattern for composability
 * Reason: Allows creating reusable middleware functions for different roles.
 *         Can be used directly in route definitions.
 * 
 * Alternative: Single middleware with role parameter passed via closure
 * Rejected: Less flexible, harder to compose multiple role checks.
 * 
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
 * 
 * Decision: Support multiple roles with "any" logic
 * Reason: Some routes may be accessible by multiple roles (e.g., admin OR manager).
 *         More flexible than single role requirement.
 * 
 * Alternative: Multiple single-role middleware chained with OR logic
 * Rejected: Express middleware doesn't support OR logic natively.
 *           Would require custom logic anyway, better to make it explicit.
 * 
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
 * 
 * Decision: Convenience function for common case
 * Reason: Admin-only routes are common, saves typing and improves readability.
 *         Still uses requireRole internally for consistency.
 * 
 * Alternative: Always use requireRole('admin')
 * Rejected: Less readable, more verbose. Convenience functions improve DX.
 */
export const requireAdmin = requireRole('admin');

/**
 * Require procurement manager or admin
 * Convenience middleware for routes accessible by managers and admins
 * 
 * Decision: Convenience function for common pattern
 * Reason: Many routes need manager OR admin access. This pattern is common
 *         in RBAC systems where admins inherit manager permissions.
 * 
 * Alternative: Always use requireAnyRole('admin', 'procurement_manager')
 * Rejected: Less readable, more verbose. Expresses intent more clearly.
 */
export const requireManagerOrAdmin = requireAnyRole('admin', 'procurement_manager');

/**
 * Require employee or higher (any authenticated user)
 * Convenience middleware for routes accessible by all authenticated users
 * 
 * Decision: Support for "any authenticated user" pattern
 * Reason: Some routes just need authentication, not specific role.
 *         This makes the intent explicit and provides consistent error handling.
 * 
 * Alternative: Just use authenticate middleware without role check
 * Rejected: Less explicit about authorization requirements. This makes it clear
 *           that the route requires authentication but any role is acceptable.
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

