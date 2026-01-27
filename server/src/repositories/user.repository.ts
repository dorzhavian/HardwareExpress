/**
 * User Repository
 * 
 * Database access layer for users table.
 * Contains only database queries, no business logic.
 * 
 * Decision: Repository pattern for database access
 * Reason: Separates data access from business logic, makes testing easier,
 *         allows swapping database implementations if needed.
 * 
 * Alternative: Direct database calls in services
 * Rejected: Violates separation of concerns, makes testing harder,
 *           doesn't follow CURSOR_RULES.md architecture.
 */

import { database } from '../config/database.js';
import { UserRow } from '../types/database.js';

/**
 * Find user by user_id
 * 
 * Note: findUserByEmail was moved to Authentication Server.
 *       Backend API only needs to find users by ID for authenticated requests.
 * 
 * @param userId - User UUID
 * @returns User row or null if not found
 */
export async function findUserById(userId: string): Promise<UserRow | null> {
  const { data, error } = await database
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserRow;
}

/**
 * Get all users
 * 
 * @returns Array of user rows
 */
export async function getAllUsers(): Promise<UserRow[]> {
  const { data, error } = await database
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return (data || []) as UserRow[];
}

/**
 * Create a new user
 * 
 * @param userData - User creation data
 * @returns Created user row
 */
export async function createUser(userData: {
  full_name: string;
  email: string;
  password_hash: string;
  role: string;
  department: string | null;
}): Promise<UserRow> {
  const { data, error } = await database
    .from('users')
    .insert({
      full_name: userData.full_name,
      email: userData.email,
      password_hash: userData.password_hash,
      role: userData.role,
      department: userData.department,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data as UserRow;
}

/**
 * Update user
 * 
 * @param userId - User UUID
 * @param updates - Partial user update data
 * @returns Updated user row or null if not found
 */
export async function updateUser(
  userId: string,
  updates: Partial<{
    full_name: string;
    email: string;
    password_hash: string;
    role: string;
    department: string | null;
  }>
): Promise<UserRow | null> {
  const { data, error } = await database
    .from('users')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return data as UserRow;
}

/**
 * Delete user
 * 
 * @param userId - User UUID
 * @returns true if deleted, false if not found
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const { error } = await database
    .from('users')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }

  // Check if any rows were deleted by trying to fetch
  const user = await findUserById(userId);
  return user === null;
}

