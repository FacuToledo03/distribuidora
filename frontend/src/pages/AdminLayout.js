import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './AdminLayout.module.css';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/productos', label: 'Productos', icon: '📦' },
  { to: '/admin/categorias', label: 'Categorías', icon: '🏷️' },
  { to: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: '🧾' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
        <div className={styles.sidebarHeader}>
          {!collapsed && <span className={styles.adminLabel}>PANEL ADMIN</span>}
        </div>
        <nav className={styles.nav}>
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/productos" className={styles.backLink}>
          <span>🏠</span>
          {!collapsed && <span>Ir al catálogo</span>}
        </NavLink>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
