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
 */

/**
 * User Role Enum
 * Matches PostgreSQL enum: user_role_enum
 */
export type UserRole = 'admin' | 'procurement_manager' | 'employee';

/**
 * Item Category Enum
 * Matches PostgreSQL enum: item_category_enum
 */
export type ItemCategory = 'Laptops' | 'Monitors' | 'Peripherals' | 'Printers' | 'Components' | 'Storage';

/**
 * Order Status Enum
 * Matches PostgreSQL enum: order_status_enum
 */
export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'completed';

/**
 * Log Action Enum
 * Matches PostgreSQL enum: log_action_enum
 */
export type LogAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'approve';

/**
 * Log Resource Enum
 * Matches PostgreSQL enum: log_resource_enum
 */
export type LogResource = 'user' | 'order' | 'item' | 'auth';

/**
 * Log Status Enum
 * Matches PostgreSQL enum: log_status_enum
 */
export type LogStatus = 'success' | 'failure';

/**
 * Log Severity Enum
 * Matches PostgreSQL enum: log_severity_enum
 */
export type LogSeverity = 'low' | 'medium' | 'high' | 'critical';

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

/**
 * Catalog Items Table
 * Matches exact database schema from DATABASE_SCHEMA.md
 */
export interface CatalogItemRow {
  item_id: string; // uuid
  item_name: string; // text
  quantity: number; // integer (stock quantity)
  price: number; // integer (stored as cents)
  category: ItemCategory; // item_category_enum
  description: string | null; // text (nullable)
  specification: string | null; // text (nullable, singular)
  image_url: string | null; // text (nullable)
  in_stock: boolean | null; // boolean (nullable, defaults to true)
}

/**
 * Orders Table
 * Matches exact database schema from DATABASE_SCHEMA.md
 */
export interface OrderRow {
  order_id: string; // uuid
  user_id: string | null; // uuid (nullable, FK to users)
  total_price: number; // integer (stored as cents)
  justify_msg: string | null; // text (nullable)
  is_active: boolean | null; // boolean (nullable, defaults to true)
  status: OrderStatus | null; // order_status_enum (nullable, defaults to 'pending')
  created_at: string | null; // timestamp (nullable, defaults to now())
}

/**
 * Order Items Table
 * Matches exact database schema from DATABASE_SCHEMA.md
 */
export interface OrderItemRow {
  order_id: string; // uuid (FK to orders, part of composite PK)
  item_id: string; // uuid (FK to catalog_items, part of composite PK)
  item_name: string; // text
  quantity: number; // integer
  price: number; // integer (stored as cents)
  category: ItemCategory | null; // item_category_enum (nullable)
}

/**
 * Logs Table
 * Matches exact database schema from DATABASE_SCHEMA.md
 */
export interface LogRow {
  log_id: string; // uuid
  timestamp: string | null; // timestamp (nullable, defaults to now())
  user_id: string | null; // uuid (nullable)
  user_role: UserRole | null; // user_role_enum (nullable)
  action: LogAction; // log_action_enum
  resource: LogResource; // log_resource_enum
  status: LogStatus; // log_status_enum
  ip_address: string | null; // text (nullable)
  description: string | null; // text (nullable)
  severity: LogSeverity; // log_severity_enum
}

/**
 * Logs AI Table
 * Matches exact database schema from DATABASE_SCHEMA.md (updated)
 */
export interface LogAiRow {
  ai_id: string; // uuid
  log_id: string; // uuid (FK to logs)
  model_name: string; // text
  score: number; // float4
  threshold: number; // float4
  is_suspicious: boolean; // boolean
  raw: unknown | null; // jsonb (nullable)
  created_at: string; // timestamptz
}

/**
 * Logs table with AI score metadata
 * Used for log list joins (logs + logs_ai scores)
 */
export interface LogWithAiRow extends LogRow {
  logs_ai?: Array<{
    score: number;
    threshold: number;
  }> | null;
}




