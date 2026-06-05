import { useEffect, useState } from 'react';
import { Package, Repeat, AlertTriangle, Wrench } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { dashboardData } from '@/api/catalogo.api';
import { COLORES_PRESTAMO } from '@/utils/constants';
import { fmtFecha } from '@/utils/formatters';

const COLORES_PIE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#94a3b8'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardData()
      .then(res => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Cargando dashboard...</div>;
  if (!data) return <div className="text-gray-500">Sin datos disponibles</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">Vision general del inventario tecnologico</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package}  label="Articulos en inventario" value={data.totalArticulos} color="primary" />
        <StatCard icon={Repeat}   label="Prestamos activos"        value={data.prestamosActivos} color="blue" />
        <StatCard icon={AlertTriangle} label="Prestamos vencidos"  value={data.prestamosVencidos} color="red" />
        <StatCard icon={Wrench}   label="Mantenimientos en curso"  value={data.mantenimientosCurso} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Articulos por categoria</h3>
          {data.articulosPorCategoria?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.articulosPorCategoria.map(d => ({ name: d.categoria, value: Number(d.total) }))}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                  dataKey="value" label
                >
                  {data.articulosPorCategoria.map((_, i) => (
                    <Cell key={i} fill={COLORES_PIE[i % COLORES_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="text-gray-500 text-sm py-12 text-center">Sin datos</div>}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Prestamos por mes</h3>
          {data.prestamosPorMes?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.prestamosPorMes.map(d => ({ mes: d.mes, total: Number(d.total) }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="text-gray-500 text-sm py-12 text-center">Sin datos</div>}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Ultimos prestamos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="pb-2">ID</th>
                <th className="pb-2">Responsable</th>
                <th className="pb-2">Fecha prestamo</th>
                <th className="pb-2">Devolucion esperada</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.ultimosPrestamos?.map(p => (
                <tr key={p.ID_PRE}>
                  <td className="py-2">#{p.ID_PRE}</td>
                  <td className="py-2">{p.responsable ? `${p.responsable.NOM_RESP} ${p.responsable.APE_RESP}` : '-'}</td>
                  <td className="py-2">{fmtFecha(p.FEC_PRE)}</td>
                  <td className="py-2">{fmtFecha(p.FEC_DEV_PRO)}</td>
                  <td className="py-2"><Badge className={COLORES_PRESTAMO[p.EST_PRE]}>{p.EST_PRE}</Badge></td>
                </tr>
              ))}
              {(!data.ultimosPrestamos || data.ultimosPrestamos.length === 0) && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-500">Sin prestamos recientes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
