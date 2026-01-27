/**
 * JWT Service
 * 
 * Handles JWT token generation.
 * Uses HS256 algorithm (symmetric key).
 * 
 * Decision: Using HS256 instead of RS256
 * Reason: 
 * - Single backend architecture, no key distribution needed
 * - Simpler implementation (no key pair management)
 * - Faster verification (symmetric vs asymmetric)
 * - Sufficient for our use case
 * 
 * Alternative: RS256 (RSA with SHA-256)
 * Rejected: Adds complexity suitable for microservices with key distribution.
 *           Not needed for single-backend architecture. HS256 is simpler
 *           and sufficient for our security requirements.
 * 
 * Note: This is the Authentication Server - it only generates tokens.
 *       Token verification happens in the Backend API server.
 */

import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/api.js';

const JWT_SECRET_ENV = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET_ENV) {
  throw new Error('JWT_SECRET environment variable must be set');
}

const JWT_SECRET: string = JWT_SECRET_ENV;

/**
 * Generate a JWT token with minimal payload (user_id and role only)
 * 
 * Decision: Minimal payload (user_id + role)
 * Reason: Smaller token size, faster verification, principle of least privilege.
 *         User details fetched from database when needed.
 * 
 * Alternative: Include full user object
 * Rejected: Larger token size, security risk if compromised,
 *           data becomes stale if user updated in database.
 * 
 * @param payload - JWT payload containing user_id and role
 * @returns Signed JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload as object, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  } as jwt.SignOptions);
}
