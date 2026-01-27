/**
 * Database Type Definitions
 */

/**
 * User Role Enum
 */
export type UserRole = 'admin' | 'procurement_manager' | 'employee';

/**
 * Item Category Enum
 */
export type ItemCategory = 'Laptops' | 'Monitors' | 'Peripherals' | 'Printers' | 'Components' | 'Storage';

/**
 * Order Status Enum
 */
export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'completed';

/**
 * Log Action Enum
 */
export type LogAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'approve';

/**
 * Log Resource Enum
 */
export type LogResource = 'user' | 'order' | 'item' | 'auth';

/**
 * Log Status Enum
 */
export type LogStatus = 'success' | 'failure';

/**
 * Log Severity Enum
 */
export type LogSeverity = 'low' | 'medium' | 'high' | 'critical';

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

/**
 * Catalog Items Table
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
 * //Orders Table
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
 * AI Classification Enum
 * Values for log AI classification
 */
export type AiClassification = 'NORMAL' | 'ANOMALOUS' | 'PENDING';

/**
 * Logs Table
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
  ai_classification: AiClassification; // VARCHAR(20), defaults to 'PENDING'
}




