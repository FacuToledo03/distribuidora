import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './AdminCRUD.module.css';

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

// Field FUERA del componente principal — evita que pierda el foco al escribir
function Field({ label, name, type, placeholder, value, onChange }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.input}
        type={type || 'text'}
        placeholder={placeholder || label}
        value={value}
        onChange={e => onChange(name, e.target.value)}
      />
    </div>
  );
}

const emptyForm = {
  username: '', password: '', first_name: '', last_name: '',
  email: '', telefono: '', direccion: '', es_admin: false,
};

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const cargar = async () => {
    setLoading(true);
    const res = await api.get('/usuarios/');
    setUsuarios(res.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const handleChange = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const abrirCrear = () => { setForm(emptyForm); setError(''); setModal('crear'); };

  const abrirEditar = (u) => {
    setSelected(u);
    setForm({
      username: u.username, password: '', first_name: u.first_name || '',
      last_name: u.last_name || '', email: u.email || '',
      telefono: u.perfil?.telefono || '', direccion: u.perfil?.direccion || '',
      es_admin: u.es_admin,
    });
    setError('');
    setModal('editar');
  };

  const cerrar = () => { setModal(null); setSelected(null); };

  const guardar = async () => {
    setSaving(true);
    setError('');
    try {
      if (modal === 'crear') {
        await api.post('/usuarios/', form);
      } else {
        await api.put(`/usuarios/${selected.id}/`, form);
      }
      await cargar();
      cerrar();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.username?.[0] || data?.password?.[0] || JSON.stringify(data) || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    await api.delete(`/usuarios/${id}/`);
    await cargar();
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Usuarios</h1>
          <p className={styles.subtitle}>{usuarios.length} clientes registrados</p>
        </div>
        <button className={styles.addBtn} onClick={abrirCrear}>+ Nuevo usuario</button>
      </div>

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner}/></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
                  <td>{u.email || '—'}</td>
                  <td>{u.perfil?.telefono || '—'}</td>
                  <td>
                    <span className={styles.rolBadge} style={u.es_admin
                      ? { background: 'rgba(245,158,11,0.1)', color: '#d97706' }
                      : { background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                      {u.es_admin ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => abrirEditar(u)}>Editar</button>
                      <button className={styles.delBtn} onClick={() => eliminar(u.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'crear' ? 'Nuevo usuario' : 'Editar usuario'} onClose={cerrar}>
          <div className={styles.formGrid}>
            <Field label="Usuario *" name="username" placeholder="nombre_usuario" value={form.username} onChange={handleChange} />
            <Field label={modal === 'crear' ? 'Contraseña *' : 'Nueva contraseña (opcional)'} name="password" type="password" placeholder="••••••" value={form.password} onChange={handleChange} />
            <Field label="Nombre" name="first_name" value={form.first_name} onChange={handleChange} />
            <Field label="Apellido" name="last_name" value={form.last_name} onChange={handleChange} />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            <Field label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
            <div className={styles.field} style={{ gridColumn: '1/-1' }}>
              <label className={styles.label}>Dirección de entrega</label>
              <input className={styles.input} type="text" placeholder="Dirección de entrega" value={form.direccion} onChange={e => setForm(prev => ({ ...prev, direccion: e.target.value }))} />
            </div>
            <div className={styles.field} style={{ gridColumn: '1/-1' }}>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={form.es_admin} onChange={e => setForm(prev => ({ ...prev, es_admin: e.target.checked }))} />
                Es administrador
              </label>
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