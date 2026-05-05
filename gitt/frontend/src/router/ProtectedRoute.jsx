import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children, roles }) {
  const { token, usuario } = useAuthStore();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(usuario?.id_rol)) return <Navigate to="/dashboard" replace />;
  return children;
}
