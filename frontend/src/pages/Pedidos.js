import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import styles from './Pedidos.module.css';

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  confirmado: { label: 'Confirmado', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  enviado: { label: 'Enviado', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  entregado: { label: 'Entregado', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  cancelado: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

function EstadoBadge({ estado }) {
  const s = ESTADOS[estado] || { label: estado, color: '#888', bg: '#f0f0f0' };
  return (
    <span className={styles.badge} style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(null);
  const [searchParams] = useSearchParams();
  const nuevo = searchParams.get('nuevo');

  useEffect(() => {
    api.get('/pedidos/').then(res => {
      setPedidos(res.data.results || res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className={styles.loading}><div className={styles.spinner}/><p>Cargando pedidos...</p></div>
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mis Pedidos</h1>

      {nuevo && (
        <div className={styles.success}>
          ✅ ¡Pedido realizado con éxito! Pronto te contactaremos para coordinar la entrega.
        </div>
      )}

      {pedidos.length === 0 ? (
        <div className={styles.empty}>
          <span>📋</span>
          <p>Todavía no tenés pedidos</p>
        </div>
      ) : (
        <div className={styles.list}>
          {pedidos.map(pedido => (
            <div key={pedido.id} className={styles.pedidoCard}>
              <div
                className={styles.pedidoHeader}
                onClick={() => setExpandido(expandido === pedido.id ? null : pedido.id)}
              >
                <div className={styles.pedidoInfo}>
                  <span className={styles.pedidoNum}>Pedido #{pedido.id}</span>
                  <span className={styles.pedidoFecha}>
                    {new Date(pedido.creado_en).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className={styles.pedidoMeta}>
                  <EstadoBadge estado={pedido.estado} />
                  <span className={styles.pedidoTotal}>${Number(pedido.total).toLocaleString('es-AR')}</span>
                  <span className={styles.chevron}>{expandido === pedido.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expandido === pedido.id && (
                <div className={styles.pedidoBody}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>Precio unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.detalles.map(d => (
                        <tr key={d.id}>
                          <td>{d.producto_nombre}</td>
                          <td>{d.cantidad}</td>
                          <td>${Number(d.precio_unitario).toLocaleString('es-AR')}</td>
                          <td>${Number(d.subtotal).toLocaleString('es-AR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pedido.notas && (
                    <p className={styles.notas}><strong>Notas:</strong> {pedido.notas}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
