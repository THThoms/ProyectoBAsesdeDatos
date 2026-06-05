import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificacionStore } from '@/store/notificacionStore';
import { logoutApi } from '@/api/auth.api';
import { ROL_NOMBRE } from '@/utils/constants';
import { fmtFechaHora } from '@/utils/formatters';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { usuario, logout } = useAuthStore();
  const { notificaciones, cargar } = useNotificacionStore();
  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 30000);
    return () => clearInterval(id);
  }, [cargar]);

  const handleLogout = async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    logout();
    toast.success('Sesion cerrada');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">Sistema GITT</h2>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button onClick={() => setOpenNotif(!openNotif)} className="relative p-2 rounded-md hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
            {notificaciones.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {notificaciones.length}
              </span>
            )}
          </button>
          {openNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-20">
              <div className="px-4 py-2 border-b font-semibold text-sm">Notificaciones</div>
              <ul className="max-h-80 overflow-y-auto">
                {notificaciones.length === 0 && (
                  <li className="px-4 py-3 text-sm text-gray-500">Sin notificaciones nuevas</li>
                )}
                {notificaciones.slice(0, 5).map(n => (
                  <li key={n.ID_NOT} className="px-4 py-2 border-b last:border-0 hover:bg-gray-50">
                    <div className="font-medium text-sm">{n.ASU_NOT}</div>
                    <div className="text-xs text-gray-500">{n.MEN_NOT}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{fmtFechaHora(n.FEC_GEN)}</div>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setOpenNotif(false); navigate('/notificaciones'); }}
                className="block w-full px-4 py-2 text-center text-sm text-primary-600 hover:bg-gray-50 border-t"
              >
                Ver todas
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setOpenUser(!openUser)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md">
            <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
              {usuario?.nombre?.[0] || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium">{usuario?.nombre}</div>
              <div className="text-xs text-gray-500">{ROL_NOMBRE[usuario?.id_rol]}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          {openUser && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-red-600">
                <LogOut className="h-4 w-4" /> Cerrar sesion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
