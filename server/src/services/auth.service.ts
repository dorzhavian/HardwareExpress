/**
 * Business logic for authentication operations.
 * Handles user retrieval for authenticated requests.
 */

import { findUserById } from '../repositories/user.repository.js';
import { UserResponse } from '../types/api.js';
import { UserRow } from '../types/database.js';

/**
 * Transform database user row to API response
 * Removes password_hash and converts field names
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




