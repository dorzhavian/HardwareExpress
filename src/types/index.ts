export type UserRole = 'admin' | 'procurement_manager' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  avatar?: string;
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
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

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  totalSpent: number;
  monthlyBudget: number;
}
