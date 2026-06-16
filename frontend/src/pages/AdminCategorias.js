import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './AdminCRUD.module.css';

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const cargar = async () => {
    setLoading(true);
    const [cRes, mRes] = await Promise.all([
      api.get('/categorias/'),
      api.get('/marcas/'),
    ]);
    setCategorias(cRes.data);
    setMarcas(mRes.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => { setSelected(null); setNombre(''); setMarca(''); setError(''); setModal(true); };
  const abrirEditar = (c) => { setSelected(c); setNombre(c.nombre); setMarca(c.marca || ''); setError(''); setModal(true); };
  const cerrar = () => { setModal(false); setSelected(null); };

  const guardar = async () => {
    if (!nombre.trim()) { setError('El nombre es requerido.'); return; }
    if (!marca) { setError('Debe seleccionar una marca.'); return; }
    setSaving(true);
    setError('');
    try {
      const data = { nombre, marca: parseInt(marca) };
      if (selected) {
        await api.put(`/categorias/${selected.id}/`, data);
      } else {
        await api.post('/categorias/', data);
      }
      await cargar();
      cerrar();
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || 'Error.');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    await api.delete(`/categorias/${id}/`);
    await cargar();
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Categorías</h1>
          <p className={styles.subtitle}>{categorias.length} categorías</p>
        </div>
        <button className={styles.addBtn} onClick={abrirCrear}>+ Nueva categoría</button>
      </div>

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner}/></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Nombre</th><th>Marca</th><th>Acciones</th></tr></thead>
            <tbody>
              {categorias.map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--muted)' }}>#{c.id}</td>
                  <td><strong>{c.nombre}</strong></td>
                  <td>{c.marca_nombre || '—'}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => abrirEditar(c)}>Editar</button>
                      <button className={styles.delBtn} onClick={() => eliminar(c.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className={styles.overlay} onClick={cerrar}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className={styles.modalHeader}>
              <h2>{selected ? 'Editar categoría' : 'Nueva categoría'}</h2>
              <button className={styles.closeBtn} onClick={cerrar}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div className={styles.field}>
                <label className={styles.label}>Marca *</label>
                <select className={styles.input} value={marca} onChange={e => setMarca(e.target.value)}>
                  <option value="">Seleccione una marca</option>
                  {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div className={styles.field} style={{ marginTop: 16 }}>
                <label className={styles.label}>Nombre *</label>
                <input className={styles.input} autoFocus type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Bebidas" />
              </div>
              {error && <div className={styles.error} style={{ marginTop: 12 }}>{error}</div>}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={cerrar}>Cancelar</button>
              <button className={styles.saveBtn} onClick={guardar} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
