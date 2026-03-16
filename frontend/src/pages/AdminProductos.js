import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import styles from './AdminCRUD.module.css';
import imgStyles from './AdminProductos.module.css';

function Modal({ title, onClose, children }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const emptyForm = { nombre: '', descripcion: '', precio: '', stock: '', categoria: '', activo: true };

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const fileInputRef = useRef();

  const cargar = async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      api.get('/productos/', { params: { busqueda: busqueda || undefined } }),
      api.get('/categorias/'),
    ]);
    setProductos(pRes.data.results || pRes.data);
    setCategorias(cRes.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [busqueda]);

  const abrirCrear = () => {
    setForm(emptyForm);
    setImagenFile(null);
    setImagenPreview(null);
    setError('');
    setModal('crear');
  };

  const abrirEditar = (p) => {
    setSelected(p);
    setForm({ nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, stock: p.stock, categoria: p.categoria || '', activo: p.activo });
    setImagenFile(null);
    setImagenPreview(p.imagen_url || null);
    setError('');
    setModal('editar');
  };

  const cerrar = () => { setModal(null); setSelected(null); setImagenFile(null); setImagenPreview(null); };

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
    setSaving(true);
    setError('');
    try {
      if (imagenFile) {
        const formData = new FormData();
        Object.entries(form).forEach(([key, val]) => {
          if (val !== '' && val !== null) formData.append(key, val);
        });
        formData.append('imagen', imagenFile);
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        if (modal === 'crear') {
          await api.post('/productos/', formData, config);
        } else {
          await api.patch(`/productos/${selected.id}/`, formData, config);
        }
      } else {
        const data = { ...form, categoria: form.categoria || null };
        if (modal === 'crear') {
          await api.post('/productos/', data);
        } else {
          await api.patch(`/productos/${selected.id}/`, data);
        }
      }
      await cargar();
      cerrar();
    } catch (err) {
      const d = err.response?.data;
      setError(d?.nombre?.[0] || d?.precio?.[0] || d?.stock?.[0] || JSON.stringify(d) || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    await api.delete(`/productos/${id}/`);
    await cargar();
  };

  const stockClass = (stock) => {
    if (stock === 0) return styles.stockCero;
    if (stock <= 5) return styles.stockBajo;
    return styles.stockOk;
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Productos</h1>
          <p className={styles.subtitle}>{productos.length} productos</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 14, minWidth: 200 }}
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <button className={styles.addBtn} onClick={abrirCrear}>+ Nuevo producto</button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner}/></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className={imgStyles.thumbWrap}>
                      {p.imagen_url
                        ? <img src={p.imagen_url} alt={p.nombre} className={imgStyles.thumb} />
                        : <span className={imgStyles.noThumb}>📦</span>
                      }
                    </div>
                  </td>
                  <td><strong>{p.nombre}</strong></td>
                  <td>{p.categoria_nombre || '—'}</td>
                  <td>${Number(p.precio).toLocaleString('es-AR')}</td>
                  <td><span className={stockClass(p.stock)}>{p.stock}</span></td>
                  <td>
                    <span className={styles.rolBadge} style={p.activo ? { background: 'rgba(34,197,94,0.1)', color: '#16a34a' } : { background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => abrirEditar(p)}>Editar</button>
                      <button className={styles.delBtn} onClick={() => eliminar(p.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'crear' ? 'Nuevo producto' : 'Editar producto'} onClose={cerrar}>
          <div className={styles.formGrid}>

            {/* Upload de imagen */}
            <div className={styles.field} style={{ gridColumn: '1/-1' }}>
              <label className={styles.label}>Imagen del producto</label>
              <div className={imgStyles.uploadArea}>
                {imagenPreview ? (
                  <div className={imgStyles.previewWrap}>
                    <img src={imagenPreview} alt="Preview" className={imgStyles.preview} />
                    <button type="button" className={imgStyles.removeImg} onClick={quitarImagen}>
                      ✕ Quitar imagen
                    </button>
                  </div>
                ) : (
                  <div className={imgStyles.dropZone} onClick={() => fileInputRef.current?.click()}>
                    <span className={imgStyles.uploadIcon}>🖼️</span>
                    <span className={imgStyles.uploadText}>Hacé clic para subir una imagen</span>
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

            <div className={styles.field} style={{ gridColumn: '1/-1' }}>
              <label className={styles.label}>Nombre *</label>
              <input className={styles.input} type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del producto" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Precio *</label>
              <input className={styles.input} type="number" step="0.01" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} placeholder="0.00" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Stock *</label>
              <input className={styles.input} type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Categoría</label>
              <select className={styles.input} value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Estado</label>
              <select className={styles.input} value={form.activo} onChange={e => setForm({ ...form, activo: e.target.value === 'true' })}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
            <div className={styles.field} style={{ gridColumn: '1/-1' }}>
              <label className={styles.label}>Descripción</label>
              <textarea className={styles.input} rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción opcional..." style={{ resize: 'vertical' }} />
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={cerrar}>Cancelar</button>
            <button className={styles.saveBtn} onClick={guardar} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}