# 🏭 Sistema de Distribuidora

Aplicación web completa con Django (backend) + React (frontend) para gestión de ventas de distribuidora.

---

## 🗂️ Estructura del proyecto

```
distribuidora/
├── backend/          # Configuración Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── api/              # App principal Django
│   ├── models.py     # Modelos: Producto, Pedido, Usuario, etc.
│   ├── views.py      # Endpoints REST
│   ├── serializers.py
│   └── urls.py
├── frontend/         # App React
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── context/   # AuthContext, CartContext
│       ├── pages/     # Login, Productos, Carrito, Pedidos, Admin/*
│       ├── components/ # Navbar
│       └── services/  # Axios (api.js)
├── manage.py
├── requirements.txt
└── inicializar.py    # Script de setup inicial
```

---

## 🚀 Instalación y puesta en marcha

### 1. Backend (Django)

```bash
# Clonar/descomprimir el proyecto
cd distribuidora

# Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# Instalar dependencias Python
pip install -r requirements.txt

# Crear la base de datos
python manage.py migrate

# Crear usuario admin y productos de ejemplo
python inicializar.py

# Iniciar el servidor backend
python manage.py runserver
```

El backend queda en: **http://localhost:8000**

---

### 2. Frontend (React)

En una **terminal nueva**:

```bash
cd distribuidora/frontend

# Instalar dependencias Node
npm install

# Iniciar el servidor de desarrollo
npm start
```

El frontend queda en: **http://localhost:3000**

> El archivo `package.json` ya tiene configurado `"proxy": "http://localhost:8000"` para que las llamadas a la API funcionen automáticamente.

---

## 🔐 Accesos iniciales

| Rol         | Usuario | Contraseña |
|-------------|---------|------------|
| Admin       | admin   | admin123   |

El admin puede crear usuarios clientes desde el panel de administración.

---

## 📋 Funcionalidades

### Cliente
- 🔐 Login con usuario y contraseña
- 📦 Ver catálogo de productos con búsqueda y filtro por categoría
- 🛒 Agregar productos al carrito (respeta el stock)
- ✅ Confirmar pedido (descuenta stock automáticamente)
- 📋 Ver historial de pedidos propios

### Administrador
- 📊 Dashboard con estadísticas y alertas de stock bajo
- 📦 CRUD completo de productos (crear, editar, eliminar, activar/desactivar)
- 🏷️ CRUD de categorías
- 👥 CRUD de usuarios clientes (crear con usuario+contraseña)
- 🧾 Ver todos los pedidos y cambiar su estado
- 🛒 También puede comprar desde el catálogo

---

## 🔌 API Endpoints

```
POST   /api/auth/login/          → Login
POST   /api/auth/logout/         → Logout
GET    /api/auth/perfil/         → Perfil del usuario logueado

GET    /api/productos/           → Listar productos (filtros: ?busqueda=&categoria=)
POST   /api/productos/           → Crear producto (admin)
PUT    /api/productos/{id}/      → Editar producto (admin)
DELETE /api/productos/{id}/      → Eliminar producto (admin)

GET    /api/categorias/          → Listar categorías
POST   /api/categorias/          → Crear categoría (admin)

GET    /api/usuarios/            → Listar clientes (admin)
POST   /api/usuarios/            → Crear cliente (admin)
PUT    /api/usuarios/{id}/       → Editar cliente (admin)
DELETE /api/usuarios/{id}/       → Eliminar cliente (admin)

GET    /api/pedidos/             → Pedidos (propios si cliente, todos si admin)
POST   /api/pedidos/             → Crear pedido (descuenta stock)
PUT    /api/pedidos/{id}/        → Cambiar estado (admin)

GET    /api/dashboard/           → Estadísticas generales (admin)
```

---

## 🛠️ Tecnologías

- **Backend:** Python 3.x + Django 5 + Django REST Framework + SQLite
- **Frontend:** React 18 + React Router v6 + Axios + CSS Modules
- **Auth:** Token Authentication (DRF)

---

## 📌 Notas para producción

- Cambiar `SECRET_KEY` en `backend/settings.py`
- Cambiar `DEBUG = False`
- Configurar `ALLOWED_HOSTS` con tu dominio
- Usar `python manage.py collectstatic` para archivos estáticos
- Considerar PostgreSQL para producción
- Ejecutar `npm run build` en el frontend para generar la versión optimizada
