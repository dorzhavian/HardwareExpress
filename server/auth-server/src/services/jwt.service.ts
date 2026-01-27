/**
 * Handles JWT token generation.
 * Uses HS256 algorithm (symmetric key).
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
 * @param payload - JWT payload containing user_id and role
 * @returns Signed JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload as object, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  } as jwt.SignOptions);
}
