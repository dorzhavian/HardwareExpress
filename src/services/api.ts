/**
 * Mock API Service
 * 
 * This file contains mock implementations of API calls.
 * Replace these with real API calls when backend is ready.
 */

import { User, Equipment, Order, DashboardStats, OrderStatus } from '@/types';
import { mockUsers, mockEquipment, mockOrders, mockDashboardStats } from './mockData';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authApi = {
  login: async (email: string, _password: string): Promise<User | null> => {
    await delay(800);
    const user = mockUsers.find(u => u.email === email);
    return user || null;
  },

  logout: async (): Promise<void> => {
    await delay(300);
  },

  getCurrentUser: async (): Promise<User | null> => {
    await delay(200);
    // In a real app, this would check the JWT token
    return null;
  },
};

// Equipment API
export const equipmentApi = {
  getAll: async (): Promise<Equipment[]> => {
    await delay(500);
    return mockEquipment;
  },

  getById: async (id: string): Promise<Equipment | null> => {
    await delay(300);
    return mockEquipment.find(e => e.id === id) || null;
  },

  getByCategory: async (category: string): Promise<Equipment[]> => {
    await delay(400);
    if (category === 'All') return mockEquipment;
    return mockEquipment.filter(e => e.category === category);
  },

  search: async (query: string): Promise<Equipment[]> => {
    await delay(400);
    const lowerQuery = query.toLowerCase();
    return mockEquipment.filter(e => 
      e.name.toLowerCase().includes(lowerQuery) ||
      e.description.toLowerCase().includes(lowerQuery) ||
      e.category.toLowerCase().includes(lowerQuery)
    );
  },
};

// Orders API
export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    await delay(500);
    return mockOrders;
  },

  getByUserId: async (userId: string): Promise<Order[]> => {
    await delay(400);
    return mockOrders.filter(o => o.userId === userId);
  },

  getById: async (id: string): Promise<Order | null> => {
    await delay(300);
    return mockOrders.find(o => o.id === id) || null;
  },

  create: async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    await delay(600);
    const newOrder: Order = {
      ...order,
      id: `ORD-${String(mockOrders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockOrders.push(newOrder);
    return newOrder;
  },

  updateStatus: async (orderId: string, status: OrderStatus): Promise<Order | null> => {
    await delay(400);
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
    }
    return order || null;
  },
};

// Users API (Admin only)
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    await delay(500);
    return mockUsers;
  },

  getById: async (id: string): Promise<User | null> => {
    await delay(300);
    return mockUsers.find(u => u.id === id) || null;
  },

  create: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    await delay(500);
    const newUser: User = {
      ...user,
      id: String(mockUsers.length + 1),
      createdAt: new Date().toISOString().split('T')[0],
    };
    mockUsers.push(newUser);
    return newUser;
  },

  update: async (id: string, updates: Partial<User>): Promise<User | null> => {
    await delay(400);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      return mockUsers[userIndex];
    }
    return null;
  },

  delete: async (id: string): Promise<boolean> => {
    await delay(400);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers.splice(index, 1);
      return true;
    }
    return false;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(400);
    return mockDashboardStats;
  },

  getRecentOrders: async (limit: number = 5): Promise<Order[]> => {
    await delay(300);
    return mockOrders.slice(0, limit);
  },
};
