/**
 * Types for API requests and responses.
 * These types represent the frontend-facing API contract.
 */

import { UserRole } from './database.js';

/**
 * JWT Payload
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
