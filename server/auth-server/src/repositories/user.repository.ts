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
 * 
 * Note: This is the Authentication Server - it only needs to find users by email
 *       for authentication purposes. Other user operations are handled by Backend API.
 */

import { database } from '../config/database.js';
import { UserRow } from '../types/database.js';

/**
 * Find user by email
 * 
 * @param email - User email address
 * @returns User row or null if not found
 */
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { data, error } = await database
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserRow;
}
