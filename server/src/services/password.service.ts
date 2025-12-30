/**
 * Password Service
 * 
 * Handles password hashing and verification using bcrypt.
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
 */

import bcrypt from 'bcrypt';

/**
 * Number of rounds for bcrypt hashing.
 * Higher = more secure but slower.
 * 10 rounds = ~100ms on modern hardware (good balance)
 * 
 * Decision: Using 10 rounds
 * Reason: Good balance between security and performance.
 *         Can be increased in production if needed.
 * 
 * Alternative: Using 12+ rounds
 * Rejected: Significantly slower (4x slower), may cause timeout
 *           issues on high-traffic endpoints. 10 rounds is sufficient
 *           for most use cases and can be increased if needed.
 */
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 * 
 * @param plainPassword - Plain text password to hash
 * @returns Hashed password (includes salt)
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

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

