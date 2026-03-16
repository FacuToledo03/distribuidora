import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const [feedback, setFeedback] = useState(false);

  useEffect(() => {
    api
      .get(`/productos/${id}/`)
      .then((res) => setProducto(res.data))
      .catch(() => navigate("/productos"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const enCarrito = items.find((i) => i.producto.id === producto?.id);
  const sinStock = producto?.stock === 0;
  const stockBajo = producto?.stock > 0 && producto?.stock <= 5;

  const handleAgregar = () => {
    agregar(producto, cantidad);
    setFeedback(true);
    setTimeout(() => setFeedback(false), 1500);
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

          {/* Stock */}
          <div className={styles.stockInfo}>
            {sinStock && (
              <span
                className={styles.stockTag}
                style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}
              >
                ✕ Sin stock
              </span>
            )}
            {stockBajo && (
              <span
                className={styles.stockTag}
                style={{ background: "rgba(245,158,11,0.1)", color: "#d97706" }}
              >
                ⚠ Últimas {producto.stock} unidades
              </span>
            )}
            {!sinStock && !stockBajo && (
              <span
                className={styles.stockTag}
                style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}
              >
                ✓ En stock ({producto.stock} disponibles)
              </span>
            )}
          </div>

          {/* Cantidad + agregar */}
          {!sinStock && (
            <div className={styles.addSection}>
              <div className={styles.cantidadWrap}>
                <span className={styles.cantidadLabel}>Cantidad</span>
                <div className={styles.cantidadControls}>
                  <button
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                    disabled={cantidad <= 1}
                  >
                    −
                  </button>
                  <span>{cantidad}</span>
                  <button
                    onClick={() =>
                      setCantidad((c) => Math.min(producto.stock, c + 1))
                    }
                    disabled={cantidad >= producto.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className={styles.subtotalWrap}>
                <span className={styles.subtotalLabel}>Subtotal</span>
                <span className={styles.subtotal}>
                  $
                  {(Number(producto.precio) * cantidad).toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          )}

          <button
            className={`${styles.addBtn} ${feedback ? styles.added : ""}`}
            onClick={handleAgregar}
            disabled={sinStock}
          >
            {sinStock
              ? "Sin stock"
              : feedback
                ? "✓ ¡Agregado al carrito!"
                : enCarrito
                  ? `+ Agregar más (${enCarrito.cantidad} en carrito)`
                  : "🛒 Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}
