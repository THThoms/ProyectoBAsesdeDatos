import api from './axios';

export const loginApi          = (correo, password) => api.post('/auth/login', { correo, password });
export const logoutApi         = () => api.post('/auth/logout');
export const meApi             = () => api.get('/auth/me');
export const changePasswordApi = (actual, nueva) => api.put('/auth/change-password', { actual, nueva });
