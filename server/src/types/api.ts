/**
 * API Type Definitions
 * Transformed types for requests and responses
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
