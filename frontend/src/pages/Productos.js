import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import styles from './Productos.module.css';

function ProductoCard({ producto }) {
  const { agregar, actualizarCantidad, quitar, items } = useCart();
  const navigate = useNavigate();

  const enCarrito = items.find(i => i.producto.id === producto.id);
  const cantidad = enCarrito ? enCarrito.cantidad : 0;

  const sinStock = producto.stock === 0;
  const stockBajo = producto.stock > 0 && producto.stock <= 5;

  const handleAgregar = () => agregar(producto, 1);

  const handleSumar = (e) => {
    e.stopPropagation();
    if (cantidad < producto.stock) actualizarCantidad(producto.id, cantidad + 1);
  };

  const handleRestar = (e) => {
    e.stopPropagation();
    if (cantidad > 1) actualizarCantidad(producto.id, cantidad - 1);
    else quitar(producto.id);
  };

  return (
    <div className={`${styles.card} ${sinStock ? styles.sinStock : ''}`}>
      <div className={styles.imgBox} onClick={() => navigate(`/productos/${producto.id}`)}>
        {producto.imagen_url
          ? <img src={producto.imagen_url} alt={producto.nombre} className={styles.img} />
          : <div className={styles.noImg}>📦</div>
        }
        {producto.categoria_nombre && (
          <span className={styles.catBadge}>{producto.categoria_nombre}</span>
        )}
        {stockBajo && !sinStock && (
          <span className={styles.stockAlerta}>⚠ Últimas {producto.stock}</span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.nombre}>{producto.nombre}</h3>
        {producto.descripcion && (
          <p className={styles.desc}>{producto.descripcion}</p>
        )}

        <div className={styles.precioWrap}>
          <span className={styles.precio}>
            ${Number(producto.precio).toLocaleString('es-AR')}
          </span>
          <span className={styles.precioUnit}>/ unidad</span>
        </div>

        {sinStock ? (
          <div className={styles.sinStockBtn}>Sin stock</div>
        ) : cantidad === 0 ? (
          <button className={styles.addBtn} onClick={handleAgregar}>
            + Agregar al carrito
          </button>
        ) : (
          <div className={styles.cantidadControl}>
            <button className={styles.ctrlBtn} onClick={handleRestar}>−</button>
            <span className={styles.ctrlNum}>{cantidad}</span>
            <button
              className={styles.ctrlBtn}
              onClick={handleSumar}
              disabled={cantidad >= producto.stock}
            >+</button>
            <span className={styles.ctrlAplicar}>en carrito</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Productos() {
  const [searchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState({ busqueda: '', categoria: searchParams.get('categoria') || '' });

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtro.busqueda) params.busqueda = filtro.busqueda;
      if (filtro.categoria) params.categoria = filtro.categoria;
      const [pRes, cRes] = await Promise.all([
        api.get('/productos/', { params }),
        api.get('/categorias/'),
      ]);
      setProductos(pRes.data.results || pRes.data);
      setCategorias(cRes.data);
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Catálogo</h1>
          <p className={styles.subtitle}>{productos.length} productos disponibles</p>
        </div>
        <div className={styles.filters}>
          <input
            className={styles.search}
            type="text"
            placeholder="Buscar producto..."
            value={filtro.busqueda}
            onChange={e => setFiltro({ ...filtro, busqueda: e.target.value })}
          />
          <select
            className={styles.select}
            value={filtro.categoria}
            onChange={e => setFiltro({ ...filtro, categoria: e.target.value })}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Cargando productos...</p>
        </div>
      ) : productos.length === 0 ? (
        <div className={styles.empty}>
          <span>🔍</span>
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {productos.map(p => <ProductoCard key={p.id} producto={p} />)}
        </div>
      )}
    </div>
  );
}