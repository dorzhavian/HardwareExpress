/**
 * Database access layer for users table.
 */

import { database } from '../config/database.js';
import { UserRow } from '../types/database.js';

/**
 * Find user by email
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
