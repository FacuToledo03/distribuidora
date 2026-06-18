import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './MiPerfil.module.css';

const GEO_API = 'https://apis.datos.gob.ar/georef/api';

export default function MiPerfil() {
  const [form, setForm] = useState({ first_name: '', last_name: '', telefono: '', direccion: '', ciudad: '', provincia: '' });
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [cargandoCiudades, setCargandoCiudades] = useState(false);

  useEffect(() => {
    fetch(`${GEO_API}/provincias?orden=nombre&max=100`)
      .then(r => r.json())
      .then(data => setProvincias(data.provincias || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/auth/perfil/').then(res => {
      const provincia = res.data.perfil?.provincia || '';
      const ciudad = res.data.perfil?.ciudad || '';
      setForm({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        telefono: res.data.perfil?.telefono || '',
        direccion: res.data.perfil?.direccion || '',
        ciudad,
        provincia,
      });
      if (provincia) cargarCiudades(provincia, ciudad);
    });
  }, []);

  const cargarCiudades = (nombreProvincia, ciudadActual = '') => {
    if (!nombreProvincia) { setCiudades([]); return; }
    setCargandoCiudades(true);
    fetch(`${GEO_API}/localidades?provincia=${encodeURIComponent(nombreProvincia)}&orden=nombre&max=1000`)
      .then(r => r.json())
      .then(data => {
        const lista = (data.localidades || []).map(l => l.nombre).sort((a, b) => a.localeCompare(b, 'es'));
        setCiudades(lista);
      })
      .catch(() => setCiudades([]))
      .finally(() => setCargandoCiudades(false));
  };

  const handleProvinciaChange = (e) => {
    const prov = e.target.value;
    setForm(prev => ({ ...prev, provincia: prov, ciudad: '' }));
    cargarCiudades(prov);
  };

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

          <div className={styles.field}>
            <label className={styles.label}>Provincia</label>
            <select className={styles.select} value={form.provincia} onChange={handleProvinciaChange}>
              <option value="">Seleccioná una provincia</option>
              {provincias.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ciudad / Localidad</label>
            <select className={styles.select} value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} disabled={!form.provincia || cargandoCiudades}>
              <option value="">
                {cargandoCiudades ? 'Cargando localidades...' : form.provincia ? 'Seleccioná una localidad' : 'Primero elegí una provincia'}
              </option>
              {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {form.ciudad && form.provincia && (
              <span className={styles.ubicacionHint}>{form.ciudad}, {form.provincia}</span>
            )}
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
