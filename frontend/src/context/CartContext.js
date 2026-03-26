import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../services/api';

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
  const syncTimer = useRef(null);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  // Sincronizar con el servidor con debounce (espera 1s después del último cambio)
  const sincronizarServidor = useCallback((itemsActuales) => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      try {
        await api.post('/carrito/sync/', { items: itemsActuales });
      } catch {}
    }, 1000);
  }, []);

  // Cargar carrito desde el servidor al iniciar
  const cargarDesdeServidor = useCallback(async () => {
    try {
      const res = await api.get('/carrito/');
      if (res.data.length > 0) {
        setItems(res.data);
        localStorage.setItem('carrito', JSON.stringify(res.data));
      }
    } catch {}
  }, []);

  const agregar = useCallback((producto, cantidad = 1) => {
    setItems(prev => {
      const existe = prev.find(i => i.producto.id === producto.id);
      let nuevos;
      if (existe) {
        const nueva = existe.cantidad + cantidad;
        if (nueva > producto.stock) return prev;
        nuevos = prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: nueva } : i);
      } else {
        nuevos = [...prev, { producto, cantidad }];
      }
      sincronizarServidor(nuevos);
      return nuevos;
    });
  }, [sincronizarServidor]);

  const quitar = useCallback((productoId) => {
    setItems(prev => {
      const nuevos = prev.filter(i => i.producto.id !== productoId);
      sincronizarServidor(nuevos);
      return nuevos;
    });
  }, [sincronizarServidor]);

  const actualizarCantidad = useCallback((productoId, cantidad) => {
    setItems(prev => {
      let nuevos;
      if (cantidad <= 0) {
        nuevos = prev.filter(i => i.producto.id !== productoId);
      } else {
        nuevos = prev.map(i => i.producto.id === productoId ? { ...i, cantidad } : i);
      }
      sincronizarServidor(nuevos);
      return nuevos;
    });
  }, [sincronizarServidor]);

  const limpiar = useCallback(async () => {
    setItems([]);
    localStorage.removeItem('carrito');
    try { await api.delete('/carrito/limpiar/'); } catch {}
  }, []);

  const total = items.reduce((acc, i) => acc + Number(i.producto.precio) * i.cantidad, 0);
  const cantidadItems = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, agregar, quitar, actualizarCantidad, limpiar, total, cantidadItems, cargarDesdeServidor }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);