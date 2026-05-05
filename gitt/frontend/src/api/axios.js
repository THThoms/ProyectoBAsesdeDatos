import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Error de conexion';
    if (status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        toast.error('Sesion expirada. Inicie sesion de nuevo.');
        window.location.href = '/login';
      }
    } else if (status >= 500) {
      toast.error('Error del servidor');
    } else if (status === 403) {
      toast.error('No tiene permisos para esta accion');
    } else if (message && status !== 401) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;
