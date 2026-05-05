import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Repeat, Wrench, ArrowLeftRight,
  Bell, Users, ScrollText, BarChart3, Database
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ROLES } from '@/utils/constants';
import clsx from 'clsx';

const items = [
  { to: '/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/inventario',     label: 'Inventario',     icon: Package },
  { to: '/prestamos',      label: 'Prestamos',      icon: Repeat },
  { to: '/mantenimientos', label: 'Mantenimientos', icon: Wrench },
  { to: '/movimientos',    label: 'Movimientos',    icon: ArrowLeftRight },
  { to: '/notificaciones', label: 'Notificaciones', icon: Bell },
  { to: '/reportes',       label: 'Reportes',       icon: BarChart3, soloAdmin: true },
  { to: '/usuarios',       label: 'Usuarios',       icon: Users,     soloAdmin: true },
  { to: '/auditoria',      label: 'Auditoria',      icon: ScrollText, soloAdmin: true }
];

export default function Sidebar() {
  const { usuario } = useAuthStore();
  const esAdmin = usuario?.id_rol === ROLES.ADMINISTRADOR;

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-primary-800 text-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-primary-700">
        <Database className="h-6 w-6" />
        <div>
          <div className="text-lg font-bold">GITT</div>
          <div className="text-xs text-primary-200">FISEI - UTA</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {items.map(({ to, label, icon: Icon, soloAdmin }) => {
          if (soloAdmin && !esAdmin) return null;
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-6 py-2.5 text-sm hover:bg-primary-700 transition',
                isActive && 'bg-primary-700 border-l-4 border-white font-semibold'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-primary-200 border-t border-primary-700">
        v1.0.0
      </div>
    </aside>
  );
}
