import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, Product } from '../types';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  isOpen: boolean;
  loading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(prev => !prev);

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!user) {
      throw new Error('Please sign in to add items to your cart');
    }
    const updated = await api.addToCart(productId, quantity);
    setCart(updated);
    setIsOpen(true);
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    const updated = await api.updateCartItem(itemId, quantity);
    setCart(updated);
  };

  const removeItem = async (itemId: number) => {
    const updated = await api.removeCartItem(itemId);
    setCart(updated);
  };

  const clearCart = async () => {
    const updated = await api.clearCart();
    setCart(updated);
  };

  const itemCount = cart?.item_count || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        loading,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
