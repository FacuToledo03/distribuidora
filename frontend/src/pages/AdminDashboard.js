import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './AdminDashboard.module.css';

function StatCard({ icon, label, value, color }) {
  return (
    <div className={styles.statCard} style={{ borderTopColor: color }}>
      <div className={styles.statIcon} style={{ background: `${color}18` }}>{icon}</div>
      <div className={styles.statText}>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/').then(res => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}><div className={styles.spinner}/></div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <StatCard icon="📦" label="Productos activos" value={stats.total_productos} color="#3b82f6" />
        <StatCard icon="👥" label="Clientes" value={stats.total_clientes} color="#8b5cf6" />
        <StatCard icon="🧾" label="Total pedidos" value={stats.total_pedidos} color="#f59e0b" />
        <StatCard icon="⏳" label="Pedidos pendientes" value={stats.pedidos_pendientes} color="#ef4444" />
        <StatCard icon="💰" label="Ventas totales" value={`$${Number(stats.ventas_totales).toLocaleString('es-AR')}`} color="#22c55e" />
      </div>

      {stats.stock_bajo.length > 0 && (
        <div className={styles.stockAlert}>
          <h2 className={styles.alertTitle}>⚠️ Productos con stock bajo</h2>
          <div className={styles.stockList}>
            {stats.stock_bajo.map(p => (
              <div key={p.id} className={styles.stockItem}>
                <span>{p.nombre}</span>
                <span className={styles.stockNum} style={{ color: p.stock === 0 ? '#ef4444' : '#f59e0b' }}>
                  {p.stock === 0 ? 'Sin stock' : `${p.stock} unidades`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}