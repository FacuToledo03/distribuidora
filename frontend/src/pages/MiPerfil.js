import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './MiPerfil.module.css';

const PROVINCIAS_CIUDADES = {
  'Buenos Aires': ['La Plata', 'Mar del Plata', 'Quilmes', 'Lomas de Zamora', 'Lanús', 'San Isidro', 'Tigre', 'Bahía Blanca', 'Tandil', 'Pergamino', 'Junín', 'Zárate', 'Campana', 'Azul', 'Olavarría'],
  'Córdoba': ['Córdoba Capital', 'Río Cuarto', 'Villa María', 'San Francisco', 'Alta Gracia', 'Villa Carlos Paz', 'Cosquín', 'Jesús María', 'Bell Ville', 'Marcos Juárez', 'Río Tercero', 'La Falda', 'Cruz del Eje', 'Arias', 'Laboulaye', 'Oncativo', 'Villa del Rosario', 'Morteros'],
  'Santa Fe': ['Rosario', 'Santa Fe Capital', 'Rafaela', 'Venado Tuerto', 'Reconquista', 'Santo Tomé', 'Esperanza', 'Casilda', 'Cañada de Gómez', 'Villa Constitución'],
  'Mendoza': ['Mendoza Capital', 'San Rafael', 'Godoy Cruz', 'Luján de Cuyo', 'Maipú', 'Las Heras', 'Rivadavia', 'General Alvear'],
  'Tucumán': ['San Miguel de Tucumán', 'Concepción', 'Tafí Viejo', 'Banda del Río Salí', 'Yerba Buena', 'Aguilares'],
  'Entre Ríos': ['Paraná', 'Concordia', 'Gualeguaychú', 'Colón', 'Villaguay', 'Federación', 'Gualeguay'],
  'Salta': ['Salta Capital', 'San Ramón de la Nueva Orán', 'Tartagal', 'Metán', 'Cafayate', 'Rosario de la Frontera'],
  'Misiones': ['Posadas', 'Oberá', 'Eldorado', 'Puerto Iguazú', 'Apóstoles', 'Leandro N. Alem'],
  'Chaco': ['Resistencia', 'Presidencia Roque Sáenz Peña', 'Villa Ángela', 'Charata', 'Barranqueras'],
  'San Juan': ['San Juan Capital', 'Rawson', 'Rivadavia', 'Caucete', 'Santa Lucía', 'Chimbas'],
  'Corrientes': ['Corrientes Capital', 'Goya', 'Paso de los Libres', 'Curuzú Cuatiá', 'Mercedes', 'Esquina'],
  'Jujuy': ['San Salvador de Jujuy', 'Palpalá', 'San Pedro de Jujuy', 'Libertador General San Martín', 'Humahuaca'],
  'Río Negro': ['Viedma', 'Bariloche', 'Cipolletti', 'General Roca', 'Allen', 'Roca'],
  'Neuquén': ['Neuquén Capital', 'Cutral Có', 'Zapala', 'San Martín de los Andes', 'Villa La Angostura'],
  'Formosa': ['Formosa Capital', 'Clorinda', 'Pirané', 'General Mosconi'],
  'Santiago del Estero': ['Santiago del Estero Capital', 'La Banda', 'Termas de Río Hondo', 'Añatuya', 'Frías'],
  'San Luis': ['San Luis Capital', 'Villa Mercedes', 'Merlo', 'Justo Daract', 'La Toma'],
  'La Pampa': ['Santa Rosa', 'General Pico', 'Toay', 'Eduardo Castex', 'Realicó'],
  'Catamarca': ['San Fernando del Valle de Catamarca', 'Andalgalá', 'Tinogasta', 'Belén', 'Santa María'],
  'La Rioja': ['La Rioja Capital', 'Chilecito', 'Aimogasta', 'Chamical', 'Chepes'],
  'Chubut': ['Rawson', 'Comodoro Rivadavia', 'Trelew', 'Puerto Madryn', 'Esquel', 'Sarmiento'],
  'Santa Cruz': ['Río Gallegos', 'Caleta Olivia', 'Pico Truncado', 'El Calafate', 'Puerto San Julián'],
  'Tierra del Fuego': ['Ushuaia', 'Río Grande', 'Tolhuin'],
  'CABA': ['Ciudad Autónoma de Buenos Aires'],
};

const PROVINCIAS = Object.keys(PROVINCIAS_CIUDADES).sort();

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

  const ciudades = form.provincia ? (PROVINCIAS_CIUDADES[form.provincia] || []) : [];

  const handleProvinciaChange = (e) => {
    setForm({ ...form, provincia: e.target.value, ciudad: '' });
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
              {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ciudad</label>
            <select className={styles.select} value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} disabled={!form.provincia}>
              <option value="">{form.provincia ? 'Seleccioná una ciudad' : 'Primero elegí una provincia'}</option>
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
