import api from './axios';

export const listarPrestamos   = (params) => api.get('/prestamos', { params });
export const obtenerPrestamo   = (id) => api.get(`/prestamos/${id}`);
export const crearPrestamo     = (data) => api.post('/prestamos', data);
export const devolverPrestamo  = (id, detalles) => api.put(`/prestamos/${id}/devolver`, { detalles });
export const cancelarPrestamo  = (id) => api.put(`/prestamos/${id}/cancelar`);
export const prestamosVencidos = () => api.get('/prestamos/vencidos');
