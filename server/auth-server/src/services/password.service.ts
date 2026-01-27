/**
 * Handles password verification using bcrypt.
 */

import bcrypt from 'bcrypt';

/**
 * Verify a plain text password against a hash
 * @param plainPassword - Plain text password to verify
 * @param hash - Hashed password from database
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}
