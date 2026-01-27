/**
 * Handles JWT token verification.
 * Uses HS256 algorithm (symmetric key).
 * Note: This is the Backend API - it only verifies tokens.
 *       Token generation happens in the Authentication Server.
 */

import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/api.js';

const JWT_SECRET_ENV = process.env.JWT_SECRET;

if (!JWT_SECRET_ENV) {
  throw new Error('JWT_SECRET environment variable must be set');
}

const JWT_SECRET: string = JWT_SECRET_ENV;

/**
 * Verify and decode a JWT token
 * 
 * @param token - JWT token to verify
 * @returns Decoded payload if valid, null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    // Token is invalid, expired, or malformed
    if (error instanceof Error) {
      console.error('JWT verification error:', error.message);
    }
    return null;
  }
}

/**
 * Extract token from Authorization header
 * 
 * @param authHeader - Authorization header value
 * @returns Token string or null if invalid format
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}



