import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Inventario from '@/pages/Inventario';
import Prestamos from '@/pages/Prestamos';
import Mantenimientos from '@/pages/Mantenimientos';
import Movimientos from '@/pages/Movimientos';
import Notificaciones from '@/pages/Notificaciones';
import Usuarios from '@/pages/Usuarios';
import Auditoria from '@/pages/Auditoria';
import Reportes from '@/pages/Reportes';
import { ROLES } from '@/utils/constants';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/inventario"     element={<Inventario />} />
        <Route path="/prestamos"      element={<Prestamos />} />
        <Route path="/mantenimientos" element={<Mantenimientos />} />
        <Route path="/movimientos"    element={<Movimientos />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route path="/reportes"       element={<ProtectedRoute roles={[ROLES.ADMINISTRADOR]}><Reportes /></ProtectedRoute>} />
        <Route path="/usuarios"       element={<ProtectedRoute roles={[ROLES.ADMINISTRADOR]}><Usuarios /></ProtectedRoute>} />
        <Route path="/auditoria"      element={<ProtectedRoute roles={[ROLES.ADMINISTRADOR]}><Auditoria /></ProtectedRoute>} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
