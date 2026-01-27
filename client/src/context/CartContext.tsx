import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Equipment, OrderItem } from '@/types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: OrderItem[];
  addItem: (equipment: Equipment, quantity?: number) => void;
  removeItem: (equipmentId: string) => void;
  updateQuantity: (equipmentId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const { user } = useAuth();

  /**
   * Clear cart when user logs out or changes
   * 
   * Decision: Clear cart on user change
   * Reason: Prevents cart data from persisting across user sessions.
   *         Each user should have their own cart state.
   * 
   * Alternative: Persist cart across users
   * Rejected: Security and privacy concern - users shouldn't see other users' cart items.
   */
  useEffect(() => {
    if (!user) {
      setItems([]);
    }
  }, [user]);

  const addItem = useCallback((equipment: Equipment, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.equipmentId === equipment.id);
      if (existing) {
        return prev.map(item =>
          item.equipmentId === equipment.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        equipmentId: equipment.id,
        equipment,
        quantity,
        unitPrice: equipment.unitPrice,
      }];
    });
  }, []);

  const removeItem = useCallback((equipmentId: string) => {
    setItems(prev => prev.filter(item => item.equipmentId !== equipmentId));
  }, []);

  const updateQuantity = useCallback((equipmentId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(equipmentId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.equipmentId === equipmentId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalAmount,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
