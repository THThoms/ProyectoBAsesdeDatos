import api from './axios';

export const listarArticulos    = (params) => api.get('/articulos', { params });
export const obtenerArticulo    = (id) => api.get(`/articulos/${id}`);
export const crearArticulo      = (data) => api.post('/articulos', data);
export const actualizarArticulo = (id, data) => api.put(`/articulos/${id}`, data);
export const eliminarArticulo   = (id) => api.delete(`/articulos/${id}`);
export const historialArticulo  = (id) => api.get(`/articulos/${id}/historial`);
