import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Home.module.css';

// ─── CARRUSEL — reemplazá las URLs por tus imágenes reales ───────────────────
const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80',
    titulo: 'Bienvenidos a nuestra distribuidora',
    subtitulo: 'Los mejores productos al mejor precio',
  },
  {
    img: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=1400&q=80',
    titulo: 'Variedad y calidad garantizada',
    subtitulo: 'Todo lo que tu negocio necesita en un solo lugar',
  },
  {
    img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1400&q=80',
    titulo: 'Entregas rápidas y seguras',
    subtitulo: 'Pedí hoy y recibí en tiempo récord',
  },
];

// ─── MAPA — reemplazá con el iframe de Google Maps de tu negocio ─────────────
const MAPA_IFRAME = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2370.584035761978!2d-62.401544697285956!3d-33.64164633980026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95c8eb3dcb93f9b7%3A0xdfd3bd98cc713465!2sLola%20vol.2!5e0!3m2!1ses-419!2sar!4v1773435457216!5m2!1ses-419!2sar" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
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
          <div className={styles.slideOverlay}>
            <h2 className={styles.slideTitulo}>{s.titulo}</h2>
            <p className={styles.slideSubtitulo}>{s.subtitulo}</p>
            <button className={styles.slideCta} onClick={() => navigate('/productos')}>
              Ver productos →
            </button>
          </div>
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
      <SeccionCategorias />
      <SeccionMapa />
    </div>
  );
}