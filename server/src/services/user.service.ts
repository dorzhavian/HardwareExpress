/**
 * User Service
 * 
 * Business logic for user management operations.
 * Handles transformations from database types to API types.
 * Admin-only operations.
 * 
 * Decision: Service layer for business logic
 * Reason: Separates business rules from controllers and repositories.
 *         Controllers handle HTTP, services handle business logic.
 * 
 * Alternative: Business logic in controllers
 * Rejected: Violates CURSOR_RULES.md requirement: "No business logic inside controllers"
 */

import {
  getAllUsers as getAllUsersFromRepo,
  findUserById,
  createUser as createUserInRepo,
  updateUser as updateUserInRepo,
  deleteUser as deleteUserInRepo,
} from '../repositories/user.repository.js';
import { hashPassword } from './password.service.js';
import { UserResponse } from '../types/api.js';
import { UserRow, UserRole } from '../types/database.js';

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
 * Get all users
 * 
 * @returns Array of user responses
 */
export async function getAllUsers(): Promise<UserResponse[]> {
  const users = await getAllUsersFromRepo();
  return users.map(transformUserToResponse);
}

/**
 * Get user by ID
 * 
 * @param userId - User UUID
 * @returns User response or null if not found
 */
export async function getUserById(userId: string): Promise<UserResponse | null> {
  const user = await findUserById(userId);
  if (!user) {
    return null;
  }
  return transformUserToResponse(user);
}

/**
 * Create a new user
 * 
 * Decision: Hash password in service layer
 * Reason: Password hashing is business logic, not data access.
 *         Repository should receive already-hashed password.
 * 
 * Alternative: Hash password in repository
 * Rejected: Repository should only handle data access, not business logic.
 * 
 * @param userData - User creation data
 * @returns Created user response
 */
export async function createUser(userData: {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string | null;
}): Promise<UserResponse> {
  // Validate email uniqueness is handled by database constraint
  // Hash password
  const password_hash = await hashPassword(userData.password);

  const user = await createUserInRepo({
    full_name: userData.full_name,
    email: userData.email.toLowerCase().trim(),
    password_hash,
    role: userData.role,
    department: userData.department || null,
  });

  return transformUserToResponse(user);
}

/**
 * Update user
 * 
 * Decision: Only hash password if provided
 * Reason: Password updates are optional. If not provided, keep existing password.
 * 
 * Alternative: Always require password on update
 * Rejected: Too restrictive - admin should be able to update other fields without password.
 * 
 * @param userId - User UUID
 * @param updates - Partial user update data
 * @returns Updated user response or null if not found
 */
export async function updateUser(
  userId: string,
  updates: {
    full_name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    department?: string | null;
  }
): Promise<UserResponse | null> {
  const updateData: any = {};

  if (updates.full_name !== undefined) {
    updateData.full_name = updates.full_name;
  }
  if (updates.email !== undefined) {
    updateData.email = updates.email.toLowerCase().trim();
  }
  if (updates.password !== undefined) {
    updateData.password_hash = await hashPassword(updates.password);
  }
  if (updates.role !== undefined) {
    updateData.role = updates.role;
  }
  if (updates.department !== undefined) {
    updateData.department = updates.department;
  }

  const user = await updateUserInRepo(userId, updateData);
  if (!user) {
    return null;
  }

  return transformUserToResponse(user);
}

/**
 * Delete user
 * 
 * @param userId - User UUID
 * @returns true if deleted, false if not found
 */
export async function deleteUser(userId: string): Promise<boolean> {
  return deleteUserInRepo(userId);
}




