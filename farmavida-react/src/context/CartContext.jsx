// ═══════════════════════════════════════════════
//  src/context/CartContext.jsx
// ═══════════════════════════════════════════════

import { createContext, useContext, useState, useCallback } from 'react';
import { fmt } from '../utils/formatters';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart]         = useState([]);
  const [isOpen, setIsOpen]     = useState(false);

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  const totals = cart.reduce(
    (acc, item) => {
      const line = item.precio * item.qty;
      acc.subtotal += line;
      if (item.audiencia === 'ninos') acc.discount += (item.precioOrig - item.precio) * item.qty;
      return acc;
    },
    { subtotal: 0, discount: 0 }
  );

  const addItem = useCallback((producto) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === producto.id);
      if (existing) {
        if (existing.qty >= producto.cantidad) return prev;
        return prev.map((c) => c.id === producto.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, {
        id:        producto.id,
        nombre:    producto.nombre,
        precio:    producto.precioFinal || producto.precio,
        precioOrig:producto.precio,
        audiencia: producto.audiencia,
        qty:       1,
        maxQty:    producto.cantidad,
      }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const changeQty = useCallback((id, delta) => {
    setCart((prev) =>
      prev.reduce((acc, item) => {
        if (item.id !== id) return [...acc, item];
        const nq = item.qty + delta;
        if (nq <= 0) return acc;
        if (nq > item.maxQty) return [...acc, item];
        return [...acc, { ...item, qty: nq }];
      }, [])
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const openCart  = useCallback(() => setIsOpen(true),  []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart= useCallback(() => setIsOpen((v) => !v), []);

  return (
    <CartContext.Provider value={{
      cart, totalItems, totals, isOpen,
      addItem, removeItem, changeQty, clearCart,
      openCart, closeCart, toggleCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
