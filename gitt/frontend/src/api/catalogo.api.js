import api from './axios';

export { listarArticulos } from './articulo.api';

export const listarRoles         = () => api.get('/roles');
export const listarCategorias    = () => api.get('/categorias');
export const listarEstados       = () => api.get('/estados');
export const listarDepartamentos = () => api.get('/departamentos');
export const listarUbicaciones   = () => api.get('/ubicaciones');
export const listarResponsables  = () => api.get('/responsables');
export const listarUsuarios      = () => api.get('/usuarios');

export const dashboardData       = () => api.get('/reportes/dashboard');
export const reporteInventario   = () => api.get('/reportes/inventario');
export const reportePrestamosAct = () => api.get('/reportes/prestamos-activos');
export const reporteMantenim     = () => api.get('/reportes/mantenimientos');

export const listarMantenimientos = (params) => api.get('/mantenimientos', { params });
export const crearMantenimiento   = (data) => api.post('/mantenimientos', data);
export const cerrarMantenimiento  = (id, data) => api.put(`/mantenimientos/${id}`, data);

export const listarMovimientos = (params) => api.get('/movimientos', { params });
export const crearMovimiento   = (data) => api.post('/movimientos', data);

export const listarNotificaciones    = (params) => api.get('/notificaciones', { params });
export const notificacionesPendientes = () => api.get('/notificaciones/pendientes');
export const marcarNotifLeida        = (id) => api.put(`/notificaciones/${id}/leer`);

export const listarAuditoria = (params) => api.get('/auditoria', { params });
