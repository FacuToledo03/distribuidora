import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logoYaya from '../assets/logo-yaya.jpeg';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout, esAdmin } = useAuth();
  const { cantidadItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/home');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <div className={styles.topBanner}>
        <span className={styles.topBannerText}>Compra mínima de $200.000</span>
      </div>
      <nav className={styles.navbar}>
        <div className={styles.inner}>
          <Link to={esAdmin ? '/admin' : '/home'} className={styles.logo}>
            <img src={logoYaya} alt="Yaya Perfumería" className={styles.logoIcon} />
            <span className={styles.logoText}>Distribuidora</span>
          </Link>

          <div className={styles.links}>
            <Link to="/productos" className={`${styles.link} ${isActive('/productos') ? styles.active : ''}`}>Productos</Link>
            {user && <Link to="/pedidos" className={`${styles.link} ${isActive('/pedidos') ? styles.active : ''}`}>Mis pedidos</Link>}
            {!esAdmin && (
              <Link to="/contacto" className={`${styles.link} ${isActive('/contacto') ? styles.active : ''}`}>Contacto</Link>
            )}
            {esAdmin && (
              <Link to="/admin" className={`${styles.link} ${styles.adminLink} ${location.pathname.startsWith('/admin') ? styles.active : ''}`}>⚙ Admin</Link>
            )}
          </div>

          <div className={styles.actions}>
            {!esAdmin && (
              <Link to="/carrito" className={styles.cartBtn}>
                🛒
                {cantidadItems > 0 && <span className={styles.badge}>{cantidadItems}</span>}
              </Link>
            )}

            <div
              className={styles.userMenu}
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button className={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <span className={styles.avatar}>👤</span>
                <span className={styles.userName}>{user ? `¡Hola, ${user?.first_name || user?.username}!` : 'Mi cuenta'}</span>
                <span className={styles.chevron}>{menuOpen ? '▲' : '▼'}</span>
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  {user ? (
                    <>
                      <div className={styles.dropdownHeader}>
                        <strong>{user?.username}</strong>
                        <small>{esAdmin ? 'Administrador' : 'Cliente'}</small>
                      </div>
                      <Link to="/mi-perfil" className={styles.dropdownLink} onClick={() => setMenuOpen(false)}>Mi perfil</Link>
                      <button onClick={handleLogout} className={styles.logoutBtn}>Cerrar sesión</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login?modo=registro" className={styles.dropdownLink}>Crear cuenta</Link>
                      <Link to="/login" className={styles.dropdownLink}>Iniciar sesión</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button className={styles.menuToggle} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu desplegable */}
        {mobileOpen && (
          <div className={styles.mobileMenu}>
            <Link to="/home" className={`${styles.mobileLink} ${isActive('/home') ? styles.active : ''}`} onClick={closeMobile}>Inicio</Link>
            <Link to="/productos" className={`${styles.mobileLink} ${isActive('/productos') ? styles.active : ''}`} onClick={closeMobile}>Productos</Link>
            {user && <Link to="/pedidos" className={`${styles.mobileLink} ${isActive('/pedidos') ? styles.active : ''}`} onClick={closeMobile}>Mis pedidos</Link>}
            {!esAdmin && (
              <Link to="/contacto" className={`${styles.mobileLink} ${isActive('/contacto') ? styles.active : ''}`} onClick={closeMobile}>Contacto</Link>
            )}
            {esAdmin && (
              <Link to="/admin" className={`${styles.mobileLink} ${location.pathname.startsWith('/admin') ? styles.active : ''}`} onClick={closeMobile}>⚙ Admin</Link>
            )}
            {user ? (
              <button onClick={handleLogout} className={styles.mobileLink} style={{ background: 'none', border: 'none', textAlign: 'left', color: 'var(--brand)', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                Cerrar sesión
              </button>
            ) : (
              <Link to="/login" className={styles.mobileLink} onClick={closeMobile}>Ingresar / Registrarse</Link>
            )}
          </div>
        )}
      </nav>
    </>
  );
}