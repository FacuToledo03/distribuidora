import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import styles from './AdminCRUD.module.css';
import imgStyles from './AdminProductos.module.css';

export default function AdminMarcas() {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [nombre, setNombre] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();

  const cargar = async () => {
    setLoading(true);
    const res = await api.get('/marcas/');
    setMarcas(res.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setSelected(null);
    setNombre('');
    setImagenFile(null);
    setImagenPreview(null);
    setError('');
    setModal(true);
  };

  const abrirEditar = (m) => {
    setSelected(m);
    setNombre(m.nombre);
    setImagenFile(null);
    setImagenPreview(m.imagen_url || null);
    setError('');
    setModal(true);
  };

  const cerrar = () => {
    setModal(false);
    setSelected(null);
    setImagenFile(null);
    setImagenPreview(null);
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagenFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagenPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const quitarImagen = () => {
    setImagenFile(null);
    setImagenPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const guardar = async () => {
    if (!nombre.trim()) { setError('El nombre es requerido.'); return; }
    setSaving(true);
    setError('');
    try {
      if (imagenFile) {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('imagen', imagenFile);
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        if (selected) {
          await api.patch(`/marcas/${selected.id}/`, formData, config);
        } else {
          await api.post('/marcas/', formData, config);
        }
      } else {
        const data = { nombre };
        if (selected) {
          await api.put(`/marcas/${selected.id}/`, data);
        } else {
          await api.post('/marcas/', data);
        }
      }
      await cargar();
      cerrar();
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta marca? Se eliminarán también todas sus categorías.')) return;
    await api.delete(`/marcas/${id}/`);
    await cargar();
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Marcas</h1>
          <p className={styles.subtitle}>{marcas.length} marcas</p>
        </div>
        <button className={styles.addBtn} onClick={abrirCrear}>+ Nueva marca</button>
      </div>

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner}/></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Nombre</th>
                <th>Categorías</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {marcas.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className={imgStyles.thumbWrap}>
                      {m.imagen_url
                        ? <img src={m.imagen_url} alt={m.nombre} className={imgStyles.thumb} />
                        : <span className={imgStyles.noThumb}>🏷️</span>
                      }
                    </div>
                  </td>
                  <td><strong>{m.nombre}</strong></td>
                  <td>{m.categorias?.length || 0} categorías</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => abrirEditar(m)}>Editar</button>
                      <button className={styles.delBtn} onClick={() => eliminar(m.id)}>Eliminar</button>
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
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className={styles.modalHeader}>
              <h2>{selected ? 'Editar marca' : 'Nueva marca'}</h2>
              <button className={styles.closeBtn} onClick={cerrar}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              {/* Upload de imagen */}
              <div className={styles.field} style={{ marginBottom: 20 }}>
                <label className={styles.label}>Logo de la marca</label>
                <div className={imgStyles.uploadArea}>
                  {imagenPreview ? (
                    <div className={imgStyles.previewWrap}>
                      <img src={imagenPreview} alt="Preview" className={imgStyles.preview} style={{ maxHeight: 120 }} />
                      <button type="button" className={imgStyles.removeImg} onClick={quitarImagen}>
                        ✕ Quitar imagen
                      </button>
                    </div>
                  ) : (
                    <div className={imgStyles.dropZone} onClick={() => fileInputRef.current?.click()}>
                      <span className={imgStyles.uploadIcon}>🖼️</span>
                      <span className={imgStyles.uploadText}>Hacé clic para subir un logo</span>
                      <span className={imgStyles.uploadHint}>PNG, JPG, WEBP — máx. 5MB</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImagenChange}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Nombre *</label>
                <input className={styles.input} autoFocus type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Coca Cola" />
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
