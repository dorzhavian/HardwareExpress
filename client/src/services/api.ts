/**
 * API Service
 * 
 * Frontend API service layer for communicating with backend.
 * Replaces mock API implementations with real HTTP calls.
 * 
 * Decision: Service layer for API calls
 * Reason: 
 * - Centralized API communication
 * - Consistent error handling
 * - Easy to test and mock
 * 
 * Alternative: Direct fetch calls in components
 * Rejected: Code duplication, harder to maintain, violates separation of concerns.
 */

import { apiGet, apiPost, apiPatch, apiDelete, setAuthToken, removeAuthToken, AUTH_BASE_URL, ApiError } from '@/lib/api-client';
import { User, Equipment, Order, DashboardStats, OrderStatus, PaginatedLogs, LogEntry } from '@/types';

/**
 * Map backend OrderStatus to frontend OrderStatus
 * 
 * Decision: Explicit mapping function
 * Reason: 
 * - Backend enum: pending, approved, rejected, completed
 * - Frontend enum: pending, approved, rejected, ordered, delivered
 * - Frontend has 'ordered' and 'delivered' which don't exist in backend
 * - We map 'completed' to 'delivered' for frontend display
 * 
 * Alternative: Change frontend enum to match backend
 * Rejected: Frontend UI may need these statuses for display purposes.
 *           Mapping allows frontend flexibility while backend stays simple.
 * 
 * Alternative: Silent mapping in API responses
 * Rejected: Violates requirement: "Handle enum mismatches explicitly (no silent mapping)"
 * 
 * @param backendStatus - Order status from backend API
 * @returns Frontend OrderStatus
 */
function mapOrderStatus(backendStatus: string): OrderStatus {
  switch (backendStatus) {
    case 'pending':
    case 'approved':
    case 'rejected':
      return backendStatus as OrderStatus;
    case 'completed':
      // Map backend 'completed' to frontend 'delivered'
      // Frontend may use 'ordered' status in future, but backend doesn't have it
      return 'delivered';
    default:
      // Unknown status - return as-is, let frontend handle it
      console.warn(`Unknown order status from backend: ${backendStatus}`);
      return backendStatus as OrderStatus;
  }
}

/**
 * Transform backend order to frontend order format
 * Handles status mapping and ensures all fields are present
 */
function transformOrder(backendOrder: any): Order {
  return {
    ...backendOrder,
    status: mapOrderStatus(backendOrder.status),
  };
}

/**
 * Transform backend log (snake_case) into frontend LogEntry (camelCase)
 */
function transformLogEntry(backendLog: any): LogEntry {
  const classification = (backendLog.ai_classification || backendLog.aiClassification || 'PENDING') as LogEntry['ai_classification'];

  return {
    id: backendLog.id ?? backendLog.log_id ?? backendLog.logId ?? '',
    timestamp: backendLog.timestamp ?? backendLog.created_at ?? null,
    user_id: backendLog.user_id ?? backendLog.userId ?? null,
    user_role: backendLog.user_role ?? backendLog.userRole ?? null,
    action: backendLog.action,
    resource: backendLog.resource,
    status: backendLog.status,
    ip_address: backendLog.ip_address ?? backendLog.ipAddress ?? null,
    description: backendLog.description ?? backendLog.ai_explanation ?? backendLog.aiExplanation ?? null,
    severity: backendLog.severity,
    ai_classification: classification,
  };
}

// Auth API
export const authApi = {
  /**
   * Login with email and password
   * Returns user data and stores JWT token
   * 
   * Decision: Use Authentication Server for login
   * Reason: Authentication Server handles password verification and JWT generation.
   *         Backend API only verifies tokens, doesn't handle login.
   * 
   * Alternative: Use Backend API for login
   * Rejected: Assignment requirements specify separate Authentication Server.
   *           This separation improves security by isolating password handling.
   * 
   * Note: Login endpoint is on Authentication Server (port 3001),
   *       while all other endpoints are on Backend API (port 3000).
   */
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const url = `${AUTH_BASE_URL}/login`;
    
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      // Network error (e.g., server unreachable)
      throw new ApiError(
        'Network error: Unable to connect to authentication server',
        0,
        { networkError: true }
      );
    }

    // Parse response
    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (error) {
        throw new ApiError(
          'Invalid JSON response from authentication server',
          response.status,
          { parseError: true }
        );
      }
    } else {
      const text = await response.text();
      throw new ApiError(
        text || 'Unexpected response format',
        response.status,
        { text }
      );
    }

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || 'Login failed',
        response.status,
        data
      );
    }

    // Store token
    setAuthToken(data.token);
    
    return data;
  },

  /**
   * Logout
   * Removes token from storage
   * 
   * Decision: Always call logout endpoint before removing token
   * Reason: Ensures logout event is logged on server side.
   *         Even if API call fails, we still remove token client-side.
   */
  logout: async (): Promise<void> => {
    try {
      // Call logout endpoint to log the event
      await apiPost('/auth/logout');
    } catch (error) {
      // Log error but don't throw - we still want to remove token
      console.error('Logout API call failed:', error);
    } finally {
      // Always remove token, even if API call fails
      removeAuthToken();
    }
  },

  /**
   * Get current authenticated user
   * Uses stored JWT token
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      return await apiGet<User>('/auth/me');
    } catch (error: any) {
      // If unauthorized, token is invalid - remove it
      if (error.status === 401) {
        removeAuthToken();
      }
      return null;
    }
  },
};

// Equipment API
export const equipmentApi = {
  /**
   * Get all equipment
   * Optional query params: category, search
   */
  getAll: async (category?: string, search?: string): Promise<Equipment[]> => {
    const params = new URLSearchParams();
    if (category && category !== 'All') {
      params.append('category', category);
    }
    if (search) {
      params.append('search', search);
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/equipment?${queryString}` : '/equipment';
    
    return apiGet<Equipment[]>(endpoint);
  },

  /**
   * Get equipment by ID
   */
  getById: async (id: string): Promise<Equipment | null> => {
    try {
      return await apiGet<Equipment>(`/equipment/${id}`);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get equipment by category
   * 
   * Decision: Use getAll with category parameter
   * Reason: Backend supports category filter in getAll endpoint.
 *         No need for separate endpoint.
   * 
   * Alternative: Separate getByCategory endpoint
   * Rejected: Backend doesn't have this endpoint, uses query params instead.
   */
  getByCategory: async (category: string): Promise<Equipment[]> => {
    return equipmentApi.getAll(category);
  },

  /**
   * Search equipment
   * 
   * Decision: Use getAll with search parameter
   * Reason: Backend supports search filter in getAll endpoint.
   * 
   * Alternative: Separate search endpoint
   * Rejected: Backend doesn't have this endpoint, uses query params instead.
   */
  search: async (query: string): Promise<Equipment[]> => {
    return equipmentApi.getAll(undefined, query);
  },
};

// Orders API
export const ordersApi = {
  /**
   * Get all orders (managers/admins only)
   */
  getAll: async (): Promise<Order[]> => {
    const orders = await apiGet<Order[]>('/orders');
    return orders.map(transformOrder);
  },

  /**
   * Get orders by user ID
   */
  getByUserId: async (userId: string): Promise<Order[]> => {
    const orders = await apiGet<Order[]>(`/orders/user/${userId}`);
    return orders.map(transformOrder);
  },

  /**
   * Get order by ID
   */
  getById: async (id: string): Promise<Order | null> => {
    try {
      const order = await apiGet<Order>(`/orders/${id}`);
      return transformOrder(order);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create new order
   * 
   * Decision: Transform request format to match backend
   * Reason: Backend expects different format than frontend Order type.
   *         Backend expects: { items: [{ equipmentId, quantity }], justification }
   * 
   * @param order - Order data in frontend format
   */
  create: async (order: {
    userId: string;
    items: Array<{ equipmentId: string; quantity: number }>;
    justification: string;
  }): Promise<Order> => {
    const response = await apiPost<Order>('/orders', {
      items: order.items,
      justification: order.justification,
    });
    
    return transformOrder(response);
  },

  /**
   * Update order status
   * 
   * Decision: Map frontend status to backend status
   * Reason: Frontend has 'ordered'/'delivered', backend has 'completed'.
   *         We map 'ordered' and 'delivered' to 'completed' when sending to backend.
   * 
   * Alternative: Change frontend to use 'completed'
   * Rejected: Frontend UI may need distinction between ordered and delivered.
   * 
   * @param orderId - Order ID
   * @param status - Frontend OrderStatus
   */
  updateStatus: async (orderId: string, status: OrderStatus): Promise<Order | null> => {
    // Map frontend status to backend status
    let backendStatus: string;
    switch (status) {
      case 'pending':
      case 'approved':
      case 'rejected':
        backendStatus = status;
        break;
      case 'ordered':
      case 'delivered':
        // Map both to 'completed' for backend
        backendStatus = 'completed';
        break;
      default:
        backendStatus = status;
    }

    try {
      const order = await apiPatch<Order>(`/orders/${orderId}/status`, {
        status: backendStatus,
      });
      return transformOrder(order);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

// Users API (Admin only)
export const usersApi = {
  /**
   * Get all users
   */
  getAll: async (): Promise<User[]> => {
    return apiGet<User[]>('/users');
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<User | null> => {
    try {
      return await apiGet<User>(`/users/${id}`);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create new user
   * 
   * Decision: Transform request format
   * Reason: Frontend uses 'name', backend expects 'full_name'.
   *         Frontend doesn't send password in User type, but API requires it.
   */
  create: async (user: {
    name: string;
    email: string;
    password: string;
    role: string;
    department: string | null;
  }): Promise<User> => {
    return apiPost<User>('/users', {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      department: user.department,
    });
  },

  /**
   * Update user
   */
  update: async (id: string, updates: Partial<{
    name: string;
    email: string;
    password: string;
    role: string;
    department: string | null;
  }>): Promise<User | null> => {
    try {
      return await apiPatch<User>(`/users/${id}`, updates);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<boolean> => {
    try {
      await apiDelete(`/users/${id}`);
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  },
};

// Dashboard API
export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    return apiGet<DashboardStats>('/dashboard/stats');
  },

  /**
   * Get recent orders
   */
  getRecentOrders: async (limit: number = 5): Promise<Order[]> => {
    const orders = await apiGet<Order[]>(`/dashboard/recent-orders?limit=${limit}`);
    return orders.map(transformOrder);
  },
};

// Logs API (Admin only)
export const logsApi = {
  /**
   * Get logs with pagination
   */
  getPage: async (
    page: number,
    pageSize: number = 25,
    filters?: {
      actions?: Array<'login' | 'logout' | 'create' | 'update' | 'delete' | 'approve'>;
      severities?: Array<'low' | 'medium' | 'high' | 'critical'>;
      statuses?: Array<'success' | 'failure'>;
    }
  ): Promise<PaginatedLogs> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    filters?.actions?.forEach((value) => params.append('action', value));
    filters?.severities?.forEach((value) => params.append('severity', value));
    filters?.statuses?.forEach((value) => params.append('status', value));

    const response = await apiGet<any>(`/logs?${params.toString()}`);
    const items = Array.isArray(response.items) ? response.items.map(transformLogEntry) : [];
    const total = Number(response.total ?? items.length);
    const resolvedPageSize = Number(response.pageSize ?? pageSize);
    const resolvedPage = Number(response.page ?? page);
    const totalPages = Number(response.totalPages ?? Math.ceil(total / resolvedPageSize || 1));

    console.log("CHECKING DATA:", response);

    return {
      items,
      page: resolvedPage,
      pageSize: resolvedPageSize,
      total,
      totalPages,
    } as PaginatedLogs;
  },
};
