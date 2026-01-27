/**
 * Password Service
 * 
 * Handles password hashing using bcrypt.
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
 * Note: This is the Backend API - it only hashes passwords for user creation/updates.
 *       Password verification happens in the Authentication Server.
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
 * Used for creating new users and updating passwords.
 * Password verification happens in Authentication Server.
 * 
 * @param plainPassword - Plain text password to hash
 * @returns Hashed password (includes salt)
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}




