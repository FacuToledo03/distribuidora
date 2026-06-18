import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './MiPerfil.module.css';

export default function MiPerfil() {
  const [form, setForm] = useState({ first_name: '', last_name: '', telefono: '', direccion: '', ciudad: '', provincia: '' });
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/perfil/').then(res => {
      setForm({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        telefono: res.data.perfil?.telefono || '',
        direccion: res.data.perfil?.direccion || '',
        ciudad: res.data.perfil?.ciudad || '',
        provincia: res.data.perfil?.provincia || '',
      });
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setExito(false);
    setError('');
    try {
      await api.put('/auth/perfil/', form);
      setExito(true);
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Mi perfil</h1>
        <p className={styles.subtitle}>Completá tus datos de contacto</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {exito && <div className={styles.exito}>Datos guardados correctamente.</div>}
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input className={styles.input} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Tu nombre" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Apellido</label>
              <input className={styles.input} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Tu apellido" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Teléfono</label>
            <input className={styles.input} value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="Ej: 3513012345" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Dirección</label>
            <input className={styles.input} value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Calle y número" />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Ciudad</label>
              <input className={styles.input} value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} placeholder="Tu ciudad" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Provincia</label>
              <input className={styles.input} value={form.provincia} onChange={e => setForm({ ...form, provincia: e.target.value })} placeholder="Tu provincia" />
            </div>
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
