/**
 * Password Service
 * 
 * Handles password verification using bcrypt.
 * 
 * Decision: Using bcrypt instead of PBKDF2
 * Reason: 
 * - bcrypt is battle-tested and widely used
 * - Built-in salt generation and cost factor
 * - Simpler API than PBKDF2
 * - Good balance of security and performance
 * - Recommended by OWASP for password hashing
 * 
 * Alternative: PBKDF2
 * Rejected: More complex API, requires manual salt management,
 *           similar security but less convenient. bcrypt's adaptive
 *           cost factor makes it easier to increase security over time.
 * 
 * Note: This is the Authentication Server - it only verifies passwords.
 *       Password hashing happens in Backend API when creating/updating users.
 */

import bcrypt from 'bcrypt';

/**
 * Verify a plain text password against a hash
 * 
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
