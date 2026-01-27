/**
 * User Role Enum
 */
export type UserRole = 'admin' | 'procurement_manager' | 'employee';

/**
 * Users Table
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
