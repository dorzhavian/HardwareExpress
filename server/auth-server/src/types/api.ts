/**
 * API Type Definitions
 * 
 * Types for API requests and responses.
 * These types represent the frontend-facing API contract.
 * 
 * Decision: Separate API types from database types
 * Reason: API uses camelCase and different field names than database.
 *         Database schema is immutable, so we transform in services.
 * 
 * Alternative: Single type for both database and API
 * Rejected: Would require changing database schema or frontend types,
 *           violating the constraint that database schema is immutable.
 */

import { UserRole } from './database.js';

/**
 * JWT Payload
 * Minimal payload containing only user_id and role.
 * 
 * Decision: Minimal JWT payload (user_id + role only)
 * Reason: Smaller token size, faster verification, follows principle of least privilege.
 *         User details can be fetched from database when needed.
 * 
 * Alternative: Include full user object in JWT
 * Rejected: Larger token size, security risk if token is compromised,
 *           user data becomes stale if updated in database.
 */
export interface JWTPayload {
  user_id: string;
  role: UserRole;
}

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    department: string | null;
    createdAt: string;
  };
}
