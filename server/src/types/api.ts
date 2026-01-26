/**
 * API Type Definitions
 * 
 * Types for API requests and responses.
 * These types represent the frontend-facing API contract.
 * Transformations from database types happen in services layer.
 * 
 * Decision: Separate API types from database types
 * Reason: API uses camelCase and different field names than database.
 *         Database schema is immutable, so we transform in services.
 * 
 * Alternative: Single type for both database and API
 * Rejected: Would require changing database schema or frontend types,
 *           violating the constraint that database schema is immutable.
 */

import {
  UserRole,
  ItemCategory,
  OrderStatus,
  LogAction,
  LogResource,
  LogStatus,
  LogSeverity,
  AiClassification,
} from './database.js';

/**
 * JWT Payload
 * Minimal payload containing only user_id and role.
 * 
 * Decision: Minimal JWT payload (user_id + role only)
 * Reason: Smaller token size, faster verification, follows principle of least privilege.
 *         User details can be fetched from database when needed.
 * 
 * Alternative: Include full user object in JWT
 * Rejected: Larger token size, security risk if token is compromised,
 *           user data becomes stale if updated in database.
 */
export interface JWTPayload {
  user_id: string;
  role: UserRole;
}

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    department: string | null;
    createdAt: string;
  };
}

/**
 * User Response (for /api/auth/me)
 * Never includes password_hash
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string | null;
  createdAt: string;
}

/**
 * Log Response
 * Transformed from LogRow
 */
export interface LogResponse {
  id: string;
  timestamp: string | null;
  userId: string | null;
  userRole: UserRole | null;
  action: LogAction;
  resource: LogResource;
  status: LogStatus;
  ipAddress: string | null;
  description: string | null;
  severity: LogSeverity;
  aiClassification: AiClassification;
  aiAlert: boolean;
}

/**
 * Equipment Response
 * Transformed from CatalogItemRow
 */
export interface EquipmentResponse {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  specifications: string;
  unitPrice: number;
  imageUrl: string;
  inStock: boolean;
  stockQuantity: number;
}

/**
 * Order Item Response
 * Part of OrderResponse
 */
export interface OrderItemResponse {
  equipmentId: string;
  equipment: EquipmentResponse;
  quantity: number;
  unitPrice: number;
}

/**
 * Order Response
 * Transformed from OrderRow with joined order_items and user data
 * 
 * Decision: Include full equipment objects in order items
 * Reason: Frontend expects complete equipment data for display.
 *         Avoids multiple API calls to fetch equipment details.
 * 
 * Alternative: Return only item_id and require separate equipment fetch
 * Rejected: Worse UX, requires multiple API calls, more complex frontend logic.
 */
export interface OrderResponse {
  id: string;
  userId: string;
  userName: string;
  department: string;
  items: OrderItemResponse[];
  totalAmount: number;
  status: OrderStatus;
  justification: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Order Request
 */
export interface CreateOrderRequest {
  items: Array<{
    equipmentId: string;
    quantity: number;
  }>;
  justification: string;
}

/**
 * Update Order Status Request
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

/**
 * Dashboard Stats Response
 */
export interface DashboardStatsResponse {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  totalSpent: number;
  monthlyBudget: number;
}

/**
 * Paginated Logs Response
 */
export interface PaginatedLogsResponse {
  items: LogResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
