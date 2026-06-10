import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import carruselPeloNuevo from '../assets/carrusel-pelo-nuevo.jpeg';
import carruselExtraAcida from '../assets/carrusel.extra-acida.jpeg';
import carruselAquaStyling from '../assets/carrusel-aqua-styling.jpeg';
import styles from './Home.module.css';

// ─── CARRUSEL — reemplazá las URLs por tus imágenes reales ───────────────────
const SLIDES = [
  {
    img: carruselPeloNuevo,
    titulo: '',
    subtitulo: '',
  },
  {
    img: carruselExtraAcida,
    titulo: '',
    subtitulo: '',
  },
  {
    img: carruselAquaStyling,
    titulo: '',
    subtitulo: '',
  },
];

// ─── MAPA — reemplazá con el iframe de Google Maps de tu negocio ─────────────
const MAPA_IFRAME = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.579013342686!2d-62.402913925644484!3d-33.64215607331417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95c8eb007a57752f%3A0xd88e4eb372c2d6f3!2sYaya%20Perfumer%C3%ADa!5e0!3m2!1ses-419!2sar!4v1778712385811!5m2!1ses-419!2sar" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
</iframe>`;
// ─────────────────────────────────────────────────────────────────────────────

function Carrusel() {
  const [actual, setActual] = useState(0);
  const navigate = useNavigate();

  const siguiente = useCallback(() => setActual(a => (a + 1) % SLIDES.length), []);
  const anterior = () => setActual(a => (a - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const t = setInterval(siguiente, 4500);
    return () => clearInterval(t);
  }, [siguiente]);

  return (
    <div className={styles.carrusel}>
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={`${styles.slide} ${i === actual ? styles.slideActive : ''}`}
          style={{ backgroundImage: `url(${s.img})` }}
        >
          {(s.titulo || s.subtitulo) && (
            <div className={styles.slideOverlay}>
              {s.titulo && <h2 className={styles.slideTitulo}>{s.titulo}</h2>}
              {s.subtitulo && <p className={styles.slideSubtitulo}>{s.subtitulo}</p>}
              <button className={styles.slideCta} onClick={() => navigate('/productos')}>
                Ver productos →
              </button>
            </div>
          )}
        </div>
      ))}

      <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={anterior}>‹</button>
      <button className={`${styles.navBtn} ${styles.navNext}`} onClick={siguiente}>›</button>

      <div className={styles.dots}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === actual ? styles.dotActive : ''}`}
            onClick={() => setActual(i)}
          />
        ))}
      </div>
    </div>
  );
}

function SeccionNuevosProductos() {
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/productos/').then(res => {
      const data = res.data.results || res.data;
      setProductos(data.filter(p => p.es_nuevo).slice(0, 8));
    });
  }, []);

  if (!productos.length) return null;

  return (
    <section className={styles.nuevosSeccion}>
      <div className={styles.seccionInner}>
        <div className={styles.nuevosHeader}>
          <div>
            <h2 className={styles.seccionTitulo}>Nuevos productos</h2>
            <p className={styles.seccionSub}>Conocé las últimas novedades disponibles</p>
          </div>
          <button className={styles.verTodosBtn} onClick={() => navigate('/productos')}>
            Ver catálogo
          </button>
        </div>
        <div className={styles.nuevosGrid}>
          {productos.map(producto => (
            <button
              key={producto.id}
              className={styles.nuevoCard}
              onClick={() => navigate(`/productos/${producto.id}`)}
            >
              <span className={styles.nuevoBadge}>Nuevo</span>
              <div className={styles.nuevoImgBox}>
                {producto.imagen_url
                  ? <img src={producto.imagen_url} alt={producto.nombre} className={styles.nuevoImg} />
                  : <span className={styles.nuevoNoImg}>🧴</span>
                }
              </div>
              <div className={styles.nuevoBody}>
                <span className={styles.nuevoCategoria}>{producto.categoria_nombre || 'Producto'}</span>
                <h3 className={styles.nuevoNombre}>{producto.nombre}</h3>
                <strong className={styles.nuevoPrecio}>${Number(producto.precio).toLocaleString('es-AR')}</strong>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeccionCategorias() {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  const ICONOS = {
    'Bebidas': '🥤', 'Lácteos': '🥛', 'Almacén': '🛒', 'Limpieza': '🧹',
    'Snacks': '🍿', 'Carnes': '🥩', 'Verduras': '🥦', 'Panadería': '🍞',
    'Congelados': '🧊', 'Perfumería': '🧴',
  };

  const COLORES = [
    '#e63946', '#3b82f6', '#22c55e', '#f59e0b',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  ];

  useEffect(() => {
    api.get('/categorias/').then(res => setCategorias(res.data));
  }, []);

  if (!categorias.length) return null;

  return (
    <section className={styles.seccion}>
      <div className={styles.seccionInner}>
        <h2 className={styles.seccionTitulo}>Nuestras categorías</h2>
        <p className={styles.seccionSub}>Encontrá todo lo que necesitás organizado por categoría</p>
        <div className={styles.catGrid}>
          {categorias.map((cat, i) => (
            <button
              key={cat.id}
              className={styles.catCard}
              onClick={() => navigate(`/productos?categoria=${cat.id}`)}
              style={{ '--cat-color': COLORES[i % COLORES.length] }}
            >
              <span className={styles.catIcon}>{ICONOS[cat.nombre] || '📦'}</span>
              <span className={styles.catNombre}>{cat.nombre}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeccionMapa() {
  return (
    <section className={styles.mapaSeccion}>
      <div className={styles.mapaInner}>
        <div className={styles.mapaTitulo}>
          <span>📍</span> UBICACIÓN
        </div>
        <div
          className={styles.mapaWrap}
          dangerouslySetInnerHTML={{ __html: MAPA_IFRAME }}
        />
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className={styles.page}>
      <Carrusel />
      <SeccionNuevosProductos />
      <SeccionCategorias />
      <SeccionMapa />
    </div>
  );
}