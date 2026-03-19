import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('carrito');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Guardar en localStorage cada vez que cambia el carrito
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  const agregar = useCallback((producto, cantidad = 1) => {
    setItems(prev => {
      const existe = prev.find(i => i.producto.id === producto.id);
      if (existe) {
        const nueva = existe.cantidad + cantidad;
        if (nueva > producto.stock) return prev;
        return prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: nueva } : i);
      }
      return [...prev, { producto, cantidad }];
    });
  }, []);

  const quitar = useCallback((productoId) => {
    setItems(prev => prev.filter(i => i.producto.id !== productoId));
  }, []);

  const actualizarCantidad = useCallback((productoId, cantidad) => {
    if (cantidad <= 0) {
      setItems(prev => prev.filter(i => i.producto.id !== productoId));
    } else {
      setItems(prev => prev.map(i => i.producto.id === productoId ? { ...i, cantidad } : i));
    }
  }, []);

  const limpiar = useCallback(() => {
    setItems([]);
    localStorage.removeItem('carrito');
  }, []);

  const total = items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);
  const cantidadItems = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, agregar, quitar, actualizarCantidad, limpiar, total, cantidadItems }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);