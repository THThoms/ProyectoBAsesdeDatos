import { create } from 'zustand';
import { notificacionesPendientes } from '@/api/catalogo.api';

export const useNotificacionStore = create((set) => ({
  notificaciones: [],
  cargar: async () => {
    try {
      const { data } = await notificacionesPendientes();
      set({ notificaciones: data.data || [] });
    } catch { /* ignore */ }
  }
}));
