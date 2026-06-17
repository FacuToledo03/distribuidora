import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import styles from "./ProductoDetalle.module.css";

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregar, items } = useCart();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    api
      .get(`/productos/${id}/`)
      .then((res) => setProducto(res.data))
      .catch(() => navigate("/productos"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Verificar si ya está en el carrito
  const enCarrito = items.find((i) => i.producto.id === producto?.id);
  const sinStock = producto?.stock === 0;

  const handleRestar = () => {
    setCantidad((c) => Math.max(1, c - 1));
  };

  const handleSumar = () => {
    if (cantidad < producto.stock) {
      setCantidad((c) => c + 1);
    }
  };

  const handleAgregar = () => {
    agregar(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 3000);
  };

  if (loading)
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );

  if (!producto) return null;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← Volver al catálogo
      </button>

      <div className={styles.layout}>
        {/* Imagen */}
        <div className={styles.imgSection}>
          <div className={styles.imgWrap}>
            {producto.imagen_url ? (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className={styles.img}
              />
            ) : (
              <div className={styles.noImg}>
                <span>📦</span>
                <p>Sin imagen</p>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className={styles.infoSection}>
          {producto.categoria_nombre && (
            <span className={styles.categoria}>
              {producto.categoria_nombre}
            </span>
          )}

          <h1 className={styles.nombre}>{producto.nombre}</h1>

          {producto.descripcion && (
            <p className={styles.descripcion}>{producto.descripcion}</p>
          )}

          <div className={styles.precioWrap}>
            <span className={styles.precio}>
              ${Number(producto.precio).toLocaleString("es-AR")}
            </span>
            <span className={styles.precioUnit}>por unidad</span>
          </div>

          {/* Stock - solo indicar disponibilidad sin cantidad */}
          <div className={styles.stockInfo}>
            {sinStock ? (
              <span
                className={styles.stockTag}
                style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}
              >
                ✕ Sin stock
              </span>
            ) : (
              <span
                className={styles.stockTag}
                style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}
              >
                ✓ En stock
              </span>
            )}
          </div>

          {/* Cantidad + agregar - diseño simple */}
          {!sinStock && (
            <div className={styles.addSection}>
              <div className={styles.cantidadControls}>
                <button onClick={handleRestar} disabled={cantidad <= 1}>−</button>
                <span>{cantidad}</span>
                <button 
                  onClick={handleSumar}
                  disabled={cantidad >= producto.stock}
                >
                  +
                </button>
              </div>

              <button
                className={styles.addBtn}
                onClick={handleAgregar}
              >
                Agregar al carrito
              </button>
            </div>
          )}

          {/* Mensaje ya agregado */}
          {(agregado || enCarrito) && !sinStock && (
            <div className={styles.yaAgregado}>
              <span className={styles.checkIcon}>✓</span>
              <span>Ya agregaste este producto.</span>
              <Link to="/carrito" className={styles.verCarrito}>VER CARRITO</Link>
            </div>
          )}

          {/* Botón sin stock */}
          {sinStock && (
            <button className={styles.addBtn} disabled>
              Sin stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
