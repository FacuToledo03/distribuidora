import React, { useState } from 'react';
import styles from './WppButton.module.css';

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const WPP_NUMERO = '5493468415492'; // Reemplazá con el número real
const WPP_MENSAJE = '¡Hola! Me comunico desde la tienda online. Quería consultar sobre un pedido.';
// ─────────────────────────────────────────────────────────────────────────────

export default function WppButton() {
  const [tooltip, setTooltip] = useState(false);
  const url = `https://wa.me/${5493468415492}?text=${encodeURIComponent(WPP_MENSAJE)}`;

  return (
    <div className={styles.wrapper}>
      {tooltip && (
        <div className={styles.tooltip}>¿Necesitás ayuda? ¡Escribinos!</div>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.btn}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        aria-label="Contactar por WhatsApp"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          className={styles.icon}
        />
      </a>
    </div>
  );
}