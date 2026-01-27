/**
 * Handles login and token generation.
 */

import { findUserByEmail } from '../repositories/user.repository.js';
import { verifyPassword } from './password.service.js';
import { generateToken } from './jwt.service.js';
import { LoginResponse } from '../types/api.js';
import { UserRow } from '../types/database.js';

/**
 * Transform database user row to API response
 * Removes password_hash and converts field names
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
