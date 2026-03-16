import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Productos from './pages/Productos';
import Carrito from './pages/Carrito';
import Pedidos from './pages/Pedidos';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductos from './pages/AdminProductos';
import AdminCategorias from './pages/AdminCategorias';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminPedidos from './pages/AdminPedidos';
import ProductoDetalle from './pages/ProductoDetalle';
import Contacto from './pages/Contacto';
import Home from './pages/Home';
import WppButton from './components/WppButton';
import Footer from './components/Footer';

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, esAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!esAdmin) return <Navigate to="/productos" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
      <WppButton />
    </div>
  );
}

function AppRoutes() {
  const { user, esAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={esAdmin ? '/admin' : '/home'} /> : <Login />} />

      <Route path="/" element={<RequireAuth><AppLayout><Navigate to={esAdmin ? '/admin' : '/home'} /></AppLayout></RequireAuth>} />
      <Route path="/home" element={<RequireAuth><AppLayout><Home /></AppLayout></RequireAuth>} />

      <Route path="/productos" element={<RequireAuth><AppLayout><Productos /></AppLayout></RequireAuth>} />
      <Route path="/carrito" element={<RequireAuth><AppLayout><Carrito /></AppLayout></RequireAuth>} />
      <Route path="/pedidos" element={<RequireAuth><AppLayout><Pedidos /></AppLayout></RequireAuth>} />
      <Route path="/productos/:id" element={<RequireAuth><AppLayout><ProductoDetalle /></AppLayout></RequireAuth>} />
      <Route path="/contacto" element={<RequireAuth><AppLayout><Contacto /></AppLayout></RequireAuth>} />

      <Route path="/admin" element={<RequireAdmin><AppLayout><AdminLayout /></AppLayout></RequireAdmin>}>
        <Route index element={<AdminDashboard />} />
        <Route path="productos" element={<AdminProductos />} />
        <Route path="categorias" element={<AdminCategorias />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="pedidos" element={<AdminPedidos />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}