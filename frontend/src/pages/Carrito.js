import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import styles from './Carrito.module.css';

export default function Carrito() {
  const { items, quitar, actualizarCantidad, limpiar, total } = useCart();
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleConfirmar = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/pedidos/', {
        items: items.map(i => ({ producto_id: i.producto.id, cantidad: i.cantidad })),
        notas,
      });
      limpiar();
      navigate('/pedidos?nuevo=1');
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.items?.[0] || data?.error || JSON.stringify(data) || 'Error al confirmar el pedido.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <span>🛒</span>
        <h2>Tu carrito está vacío</h2>
        <p>Agregá productos desde el catálogo</p>
        <Link to="/productos" className={styles.btn}>Ver catálogo</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Carrito de compras</h1>

      <div className={styles.layout}>
        <div className={styles.items}>
          {items.map(({ producto, cantidad }) => (
            <div key={producto.id} className={styles.item}>
              <div className={styles.itemImg}>
                {producto.imagen_url
                  ? <img src={producto.imagen_url} alt={producto.nombre} />
                  : <span>📦</span>
                }
              </div>
              <div className={styles.itemInfo}>
                <p className={styles.itemNombre}>{producto.nombre}</p>
                <p className={styles.itemPrecio}>${Number(producto.precio).toLocaleString('es-AR')} c/u</p>
              </div>
              <div className={styles.itemControls}>
                <button onClick={() => actualizarCantidad(producto.id, cantidad - 1)}>−</button>
                <span>{cantidad}</span>
                <button
                  onClick={() => actualizarCantidad(producto.id, cantidad + 1)}
                  disabled={cantidad >= producto.stock}
                >+</button>
              </div>
              <div className={styles.itemSubtotal}>
                ${(Number(producto.precio) * cantidad).toLocaleString('es-AR')}
              </div>
              <button className={styles.removeBtn} onClick={() => quitar(producto.id)} title="Eliminar">✕</button>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Resumen</h2>
          <div className={styles.summaryRows}>
            {items.map(({ producto, cantidad }) => (
              <div key={producto.id} className={styles.summaryRow}>
                <span>{producto.nombre} × {cantidad}</span>
                <span>${(Number(producto.precio) * cantidad).toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>${Number(total).toLocaleString('es-AR')}</span>
          </div>
          <textarea
            className={styles.notas}
            placeholder="Notas para el pedido (opcional)..."
            value={notas}
            onChange={e => setNotas(e.target.value)}
            rows={3}
          />
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.confirmarBtn} onClick={handleConfirmar} disabled={loading}>
            {loading ? 'Confirmando...' : '✓ Confirmar pedido'}
          </button>
          <Link to="/productos" className={styles.seguirBtn}>← Seguir comprando</Link>
        </div>
      </div>
    </div>
  );
}
