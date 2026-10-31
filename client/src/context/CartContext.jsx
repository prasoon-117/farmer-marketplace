import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('fm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('fm_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      const available = Number(product.available_quantity);

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = Math.min(existing.quantity + quantity, available);
        if (newQty <= 0) {
          return prev.filter((_, idx) => idx !== existingIndex);
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          subtotal: newQty * product.price,
        };
        return updated;
      } else {
        const initialQty = Math.min(Math.max(quantity, 1), available);
        if (initialQty <= 0) return prev;
        return [
          ...prev,
          {
            product,
            quantity: initialQty,
            subtotal: initialQty * product.price,
          },
        ];
      }
    });
    setIsDrawerOpen(true);
  };

  const updateQuantity = (productId, newQuantity) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const available = Number(item.product.available_quantity);
            const clamped = Math.min(Math.max(newQuantity, 0), available);
            if (clamped <= 0) return null;
            return {
              ...item,
              quantity: clamped,
              subtotal: clamped * item.product.price,
            };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        totalAmount,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
