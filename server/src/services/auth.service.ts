/**
 * Authentication Service
 * 
 * Business logic for authentication operations.
 * Handles user retrieval for authenticated requests.
 * 
 * Decision: Service layer for business logic
 * Reason: Separates business rules from controllers and repositories.
 *         Controllers handle HTTP, services handle business logic.
 * 
 * Alternative: Business logic in controllers
 * Rejected: Violates CURSOR_RULES.md requirement: "No business logic inside controllers"
 * 
 * Note: This is the Backend API - it only retrieves user data.
 *       Login and token generation happen in the Authentication Server.
 */

import { findUserById } from '../repositories/user.repository.js';
import { UserResponse } from '../types/api.js';
import { UserRow } from '../types/database.js';

/**
 * Transform database user row to API response
 * Removes password_hash and converts field names
 * 
 * Decision: Transform in service layer
 * Reason: Keeps database types separate from API types.
 *         Single transformation point for user data.
 * 
 * Alternative: Transform in repository or controller
 * Rejected: Repository should return raw database types.
 *           Controller should only handle HTTP concerns.
 */
function transformUserToResponse(user: UserRow): UserResponse {
  return {
    id: user.user_id,
    email: user.email,
    name: user.full_name,
    role: user.role,
    department: user.department,
    createdAt: user.created_at,
  };
}

/**
 * Get user by ID (for /api/auth/me endpoint)
 * 
 * @param userId - User UUID
 * @returns User response or null if not found
 */
export async function getCurrentUser(userId: string): Promise<UserResponse | null> {
  const user = await findUserById(userId);
  if (!user) {
    return null;
  }

  return transformUserToResponse(user);
}




