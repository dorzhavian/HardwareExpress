/**
 * Authentication Service
 * 
 * Business logic for authentication operations.
 * Handles login and token generation.
 * 
 * Decision: Service layer for business logic
 * Reason: Separates business rules from controllers and repositories.
 *         Controllers handle HTTP, services handle business logic.
 * 
 * Alternative: Business logic in controllers
 * Rejected: Violates CURSOR_RULES.md requirement: "No business logic inside controllers"
 * 
 * Note: This is the Authentication Server - it only handles login and token generation.
 *       User retrieval and other operations are handled by Backend API.
 */

import { findUserByEmail } from '../repositories/user.repository.js';
import { verifyPassword } from './password.service.js';
import { generateToken } from './jwt.service.js';
import { LoginResponse } from '../types/api.js';
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
function transformUserToResponse(user: UserRow): LoginResponse['user'] {
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
 * Authenticate user with email and password
 * 
 * Decision: Return user object with token, not just token
 * Reason: Frontend needs user data immediately after login.
 *         Avoids extra API call to get user details.
 * 
 * Alternative: Return only token, require separate /me call
 * Rejected: Extra round trip, worse UX, unnecessary complexity.
 * 
 * @param email - User email
 * @param password - Plain text password
 * @returns User response with token, or null if invalid credentials
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse | null> {
  // Find user by email
  const user = await findUserByEmail(email);
  if (!user) {
    // Don't reveal if email exists (security best practice)
    return null;
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  // Generate JWT token
  const token = generateToken({
    user_id: user.user_id,
    role: user.role,
  });

  // Return user (without password_hash) and token
  return {
    user: transformUserToResponse(user),
    token,
  };
}
