/**
 * Database Type Definitions
 * 
 * TypeScript types matching the exact database schema.
 * These types represent the raw database structure without any transformations.
 * 
 * Decision: Separate database types from API response types
 * Reason: Database schema uses snake_case and different field names than frontend.
 *         We'll transform these in repositories/services before sending to API.
 * 
 * Alternative: Using a single type for both database and API
 * Rejected: Would require changing database schema or frontend types, violating
 *           the constraint that database schema is the single source of truth.
 * 
 * Note: This file contains only the types needed by Authentication Server.
 *       Full database types are in ../../src/types/database.ts (shared).
 */

/**
 * User Role Enum
 * Matches PostgreSQL enum: user_role_enum
 */
export type UserRole = 'admin' | 'procurement_manager' | 'employee';

/**
 * Users Table
 * Matches exact database schema from DATABASE_SCHEMA.md
 */
export interface UserRow {
  user_id: string; // uuid
  full_name: string; // text
  email: string; // text (UNIQUE)
  password_hash: string; // text (NEVER exposed to client)
  department: string | null; // text (nullable)
  role: UserRole; // user_role_enum
  created_at: string; // timestamp (ISO string)
}
