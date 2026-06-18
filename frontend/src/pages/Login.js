import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logoYaya from '../assets/logo-yaya.jpeg';
import styles from './Login.module.css';

export default function Login() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { googleLogin } = useAuth();
  const { cargarDesdeServidor } = useCart();
  const navigate = useNavigate();
  const next = query.get('next');

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      await cargarDesdeServidor();
      navigate(next || (user.es_admin || user.is_staff ? '/admin' : '/'));
    } catch (err) {
      setError('No se pudo iniciar sesión con Google. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src={logoYaya} alt="Logo" className={styles.logo} />
          <h1 className={styles.title}>Distribuidora Yaya</h1>
          <p className={styles.subtitle}>Ingresá con tu cuenta de Google para ver tus pedidos o comprar</p>
        </div>

        <div className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {loading && <p className={styles.subtitle}>Iniciando sesión...</p>}
          {!loading && (
            <div className={styles.googleBtn}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('No se pudo iniciar sesión con Google. Intentá de nuevo.')}
                text="continue_with"
                shape="rectangular"
                locale="es"
                width="300"
              />
            </div>
          )}
          <button className={styles.publicLink} onClick={() => navigate('/')}>
            Entrar sin cuenta
          </button>
        </div>
      </div>
    </div>
  );
}