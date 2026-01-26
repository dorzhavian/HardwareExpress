export type UserRole = 'admin' | 'procurement_manager' | 'employee';

export type ItemCategory = 'Laptops' | 'Monitors' | 'Peripherals' | 'Printers' | 'Components' | 'Storage';

/**
 * User type matching backend API response
 * 
 * Decision: department is nullable to match backend
 * Reason: Backend API returns department as string | null.
 *         Frontend must adapt to backend, not vice versa.
 * 
 * Alternative: Make department required in frontend
 * Rejected: Would require backend changes, violates "backend is source of truth" principle.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string | null; // Nullable to match backend
  avatar?: string;
  createdAt: string;
}

/**
 * Equipment type matching backend API response
 * 
 * Decision: category uses ItemCategory enum type
 * Reason: Backend uses enum, frontend should use same enum values.
 * 
 * Alternative: Keep category as string
 * Rejected: Less type-safe, enum provides better type checking.
 */
export interface Equipment {
  id: string;
  name: string;
  category: ItemCategory; // Enum type matching backend
  description: string;
  specifications: string;
  unitPrice: number;
  imageUrl: string;
  inStock: boolean;
  stockQuantity: number;
}

export interface OrderItem {
  equipmentId: string;
  equipment: Equipment;
  quantity: number;
  unitPrice: number;
}

/**
 * Order Status type
 * 
 * Decision: Keep frontend statuses including 'ordered' and 'delivered'
 * Reason: 
 * - Frontend UI may need distinction between ordered and delivered
 * - Backend only has 'completed', we map it to 'delivered' in API layer
 * - Frontend can display 'ordered' status for future use
 * 
 * Alternative: Change frontend to match backend exactly
 * Rejected: Frontend UI flexibility, mapping in API layer handles the mismatch.
 * 
 * Note: Backend enum: pending, approved, rejected, completed
 *       Frontend maps 'completed' → 'delivered' when receiving from backend
 *       Frontend maps 'ordered'/'delivered' → 'completed' when sending to backend
 */
export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'ordered' | 'delivered';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  department: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  justification: string;
  createdAt: string;
  updatedAt: string;
}

export type LogAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'approve';

export type LogResource = 'user' | 'order' | 'item' | 'auth';

export type LogStatus = 'success' | 'failure';

export type LogSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AiClassification = 'NORMAL' | 'ANOMALOUS' | 'PENDING';

/**
 * Log entry type matching backend API response
 */
export interface LogEntry {
  id: string;
  timestamp: string | null;
  user_id: string | null;
  user_role: UserRole | null;
  action: LogAction;
  resource: LogResource;
  status: LogStatus;
  ip_address: string | null;
  description: string | null;
  severity: LogSeverity;
  ai_classification: AiClassification;
}

export interface PaginatedLogs {
  items: LogEntry[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  totalSpent: number;
  monthlyBudget: number;
}
