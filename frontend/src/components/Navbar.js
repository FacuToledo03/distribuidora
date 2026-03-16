import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout, esAdmin } = useAuth();
  const { cantidadItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>📦</span>
          <span className={styles.logoText}>Distribuidora</span>
        </Link>

        <div className={styles.links}>
          <Link to="/productos" className={`${styles.link} ${isActive('/productos') ? styles.active : ''}`}>
            Productos
          </Link>
          <Link to="/pedidos" className={`${styles.link} ${isActive('/pedidos') ? styles.active : ''}`}>
            Mis pedidos
          </Link>
          <Link to="/contacto" className={`${styles.link} ${isActive('/contacto') ? styles.active : ''}`}>
            Contacto
          </Link>
          {esAdmin && (
            <Link to="/admin" className={`${styles.link} ${styles.adminLink} ${location.pathname.startsWith('/admin') ? styles.active : ''}`}>
              ⚙ Admin
            </Link>
          )}
        </div>

        <div className={styles.actions}>
          <Link to="/carrito" className={styles.cartBtn}>
            🛒
            {cantidadItems > 0 && <span className={styles.badge}>{cantidadItems}</span>}
          </Link>

          <div className={styles.userMenu}>
            <button className={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
              <span className={styles.avatar}>{user?.first_name?.[0] || user?.username?.[0] || '?'}</span>
              <span className={styles.userName}>{user?.first_name || user?.username}</span>
              <span className={styles.chevron}>{menuOpen ? '▲' : '▼'}</span>
            </button>
            {menuOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <strong>{user?.username}</strong>
                  <small>{esAdmin ? 'Administrador' : 'Cliente'}</small>
                </div>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}