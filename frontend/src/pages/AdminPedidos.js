import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './AdminCRUD.module.css';
import pedStyles from './AdminPedidos.module.css';

const ESTADOS = {
  pendiente:  { label: 'Pendiente',  color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  confirmado: { label: 'Confirmado', color: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
  enviado:    { label: 'Enviado',    color: '#7c3aed', bg: 'rgba(139,92,246,0.1)' },
  entregado:  { label: 'Entregado', color: '#16a34a', bg: 'rgba(34,197,94,0.1)'  },
  cancelado:  { label: 'Cancelado', color: '#dc2626', bg: 'rgba(239,68,68,0.1)'  },
};

export default function AdminPedidos() {
  const [pedidos, setPedidos]     = useState([]);
  const [todos, setTodos]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expandido, setExpandido] = useState(null);

  // Filtros
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroEstado,  setFiltroEstado]  = useState('');
  const [filtroDesde,   setFiltroDesde]   = useState('');
  const [filtroHasta,   setFiltroHasta]   = useState('');

  const cargar = async () => {
    setLoading(true);
    const res = await api.get('/pedidos/');
    const data = res.data.results || res.data;
    setTodos(data);
    setPedidos(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  // Aplicar filtros localmente
  useEffect(() => {
    let resultado = [...todos];
    if (filtroCliente.trim()) {
      resultado = resultado.filter(p =>
        p.cliente_nombre.toLowerCase().includes(filtroCliente.toLowerCase())
      );
    }
    if (filtroEstado) {
      resultado = resultado.filter(p => p.estado === filtroEstado);
    }
    if (filtroDesde) {
      resultado = resultado.filter(p => new Date(p.creado_en) >= new Date(filtroDesde));
    }
    if (filtroHasta) {
      const hasta = new Date(filtroHasta);
      hasta.setHours(23, 59, 59);
      resultado = resultado.filter(p => new Date(p.creado_en) <= hasta);
    }
    setPedidos(resultado);
  }, [filtroCliente, filtroEstado, filtroDesde, filtroHasta, todos]);

  const limpiarFiltros = () => {
    setFiltroCliente('');
    setFiltroEstado('');
    setFiltroDesde('');
    setFiltroHasta('');
  };

  const cambiarEstado = async (id, estado) => {
    await api.put(`/pedidos/${id}/`, { estado });
    setTodos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
  };

  const hayFiltros = filtroCliente || filtroEstado || filtroDesde || filtroHasta;

  if (loading) return <div className={styles.loading}><div className={styles.spinner}/></div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Pedidos</h1>
          <p className={styles.subtitle}>{pedidos.length} de {todos.length} pedidos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className={pedStyles.filtros}>
        <input
          className={pedStyles.filtroInput}
          type="text"
          placeholder="Buscar por cliente..."
          value={filtroCliente}
          onChange={e => setFiltroCliente(e.target.value)}
        />
        <select
          className={pedStyles.filtroInput}
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <div className={pedStyles.fechaWrap}>
          <label className={pedStyles.fechaLabel}>Desde</label>
          <input
            className={pedStyles.filtroInput}
            type="date"
            value={filtroDesde}
            onChange={e => setFiltroDesde(e.target.value)}
          />
        </div>
        <div className={pedStyles.fechaWrap}>
          <label className={pedStyles.fechaLabel}>Hasta</label>
          <input
            className={pedStyles.filtroInput}
            type="date"
            value={filtroHasta}
            onChange={e => setFiltroHasta(e.target.value)}
          />
        </div>
        {hayFiltros && (
          <button className={pedStyles.limpiarBtn} onClick={limpiarFiltros}>
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {pedidos.length === 0 ? (
        <div className={pedStyles.empty}>
          <span>🔍</span>
          <p>No hay pedidos que coincidan con los filtros</p>
        </div>
      ) : (
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
                      {new Date(p.creado_en).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
      )}
    </div>
  );
}