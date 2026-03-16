import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './AdminCRUD.module.css';

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  confirmado: { label: 'Confirmado', color: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
  enviado: { label: 'Enviado', color: '#7c3aed', bg: 'rgba(139,92,246,0.1)' },
  entregado: { label: 'Entregado', color: '#16a34a', bg: 'rgba(34,197,94,0.1)' },
  cancelado: { label: 'Cancelado', color: '#dc2626', bg: 'rgba(239,68,68,0.1)' },
};

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(null);

  const cargar = async () => {
    setLoading(true);
    const res = await api.get('/pedidos/');
    setPedidos(res.data.results || res.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const cambiarEstado = async (id, estado) => {
    await api.put(`/pedidos/${id}/`, { estado });
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
  };

  if (loading) return <div className={styles.loading}><div className={styles.spinner}/></div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Pedidos</h1>
          <p className={styles.subtitle}>{pedidos.length} pedidos en total</p>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Cambiar estado</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <React.Fragment key={p.id}>
                <tr>
                  <td style={{ color: 'var(--muted)' }}>#{p.id}</td>
                  <td><strong>{p.cliente_nombre}</strong></td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                    {new Date(p.creado_en).toLocaleDateString('es-AR')}
                  </td>
                  <td><strong>${Number(p.total).toLocaleString('es-AR')}</strong></td>
                  <td>
                    <span className={styles.rolBadge} style={{ color: ESTADOS[p.estado]?.color, background: ESTADOS[p.estado]?.bg }}>
                      {ESTADOS[p.estado]?.label || p.estado}
                    </span>
                  </td>
                  <td>
                    <select
                      style={{ border: '1.5px solid var(--border)', borderRadius: 7, padding: '6px 10px', fontSize: 13, cursor: 'pointer' }}
                      value={p.estado}
                      onChange={e => cambiarEstado(p.id, e.target.value)}
                    >
                      {Object.entries(ESTADOS).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className={styles.editBtn}
                      onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                    >
                      {expandido === p.id ? 'Cerrar' : 'Ver items'}
                    </button>
                  </td>
                </tr>
                {expandido === p.id && (
                  <tr>
                    <td colSpan={7} style={{ padding: 0 }}>
                      <div style={{ background: 'var(--bg)', padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', padding: '6px 12px', color: 'var(--muted)', fontWeight: 600 }}>Producto</th>
                              <th style={{ textAlign: 'left', padding: '6px 12px', color: 'var(--muted)', fontWeight: 600 }}>Cant.</th>
                              <th style={{ textAlign: 'left', padding: '6px 12px', color: 'var(--muted)', fontWeight: 600 }}>Precio unit.</th>
                              <th style={{ textAlign: 'left', padding: '6px 12px', color: 'var(--muted)', fontWeight: 600 }}>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {p.detalles.map(d => (
                              <tr key={d.id}>
                                <td style={{ padding: '8px 12px' }}>{d.producto_nombre}</td>
                                <td style={{ padding: '8px 12px' }}>{d.cantidad}</td>
                                <td style={{ padding: '8px 12px' }}>${Number(d.precio_unitario).toLocaleString('es-AR')}</td>
                                <td style={{ padding: '8px 12px', fontWeight: 600 }}>${Number(d.subtotal).toLocaleString('es-AR')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {p.notas && <p style={{ marginTop: 10, fontSize: 13, color: 'var(--mid)' }}><strong>Notas:</strong> {p.notas}</p>}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
