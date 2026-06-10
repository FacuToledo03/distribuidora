import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logoYaya from '../assets/logo-yaya.jpeg';
import styles from './Login.module.css';

export default function Login() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [modo, setModo] = useState(query.get('modo') === 'registro' ? 'registro' : 'login');
  const [form, setForm] = useState({ username: '', password: '', confirmarPassword: '', nombreCompleto: '', email: '', telefono: '', robot: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, registro } = useAuth();
  const { cargarDesdeServidor } = useCart();
  const navigate = useNavigate();
  const next = query.get('next');

  useEffect(() => {
    setModo(query.get('modo') === 'registro' ? 'registro' : 'login');
    setError('');
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (modo === 'registro' && form.password !== form.confirmarPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
      if (modo === 'registro' && !form.robot) {
        setError('Confirmá que no sos un robot.');
        setLoading(false);
        return;
      }
      const [firstName, ...lastNameParts] = form.nombreCompleto.trim().split(' ');
      const registroData = {
        username: form.email,
        password: form.password,
        first_name: firstName || '',
        last_name: lastNameParts.join(' '),
        email: form.email,
        telefono: form.telefono,
        direccion: '',
      };
      const user = modo === 'registro'
        ? await registro(registroData)
        : await login(form.username, form.password);
      await cargarDesdeServidor();
      navigate(next || (user.es_admin || user.is_staff ? '/admin' : '/home'));
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || data?.email?.[0] || data?.username?.[0] || data?.password?.[0] || 'No se pudo completar la operación.');
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
          <p className={styles.subtitle}>{modo === 'registro' ? 'Creá tu cuenta para hacer pedidos' : 'Ingresá para ver tus pedidos o comprar'}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          {modo === 'login' && (
            <div className={styles.field}>
              <label className={styles.label}>Usuario</label>
              <input className={styles.input} type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Tu usuario" required autoFocus />
            </div>
          )}

          {modo === 'registro' && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Nombre y Apellido</label>
                <input className={styles.input} type="text" value={form.nombreCompleto} onChange={e => setForm({ ...form, nombreCompleto: e.target.value })} placeholder="Tu nombre completo" required autoFocus />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Teléfono</label>
                <input className={styles.input} type="text" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="Tu teléfono" required />
              </div>
            </>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <input className={styles.input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
          </div>

          {modo === 'registro' && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Confirmar Contraseña</label>
                <input className={styles.input} type="password" value={form.confirmarPassword} onChange={e => setForm({ ...form, confirmarPassword: e.target.value })} placeholder="••••••••" required />
              </div>
              <label className={styles.robotBox}>
                <input type="checkbox" checked={form.robot} onChange={e => setForm({ ...form, robot: e.target.checked })} />
                <span>No soy un robot</span>
              </label>
            </>
          )}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Procesando...' : modo === 'registro' ? 'Crear cuenta' : 'Ingresar'}
          </button>

          <button type="button" className={styles.switchBtn} onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError(''); }}>
            {modo === 'login' ? '¿No tenés cuenta? Registrate' : 'Ya tengo cuenta'}
          </button>

          <Link to="/home" className={styles.publicLink}>Entrar sin cuenta</Link>
        </form>
      </div>
    </div>
  );
}