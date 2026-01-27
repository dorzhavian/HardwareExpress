/**
 * Handles password hashing using bcrypt.
 */

import bcrypt from 'bcrypt';

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




