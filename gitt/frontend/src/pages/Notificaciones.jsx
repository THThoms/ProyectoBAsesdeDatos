import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '@/components/ui/Badge';
import { listarNotificaciones, marcarNotifLeida } from '@/api/catalogo.api';
import { fmtFechaHora } from '@/utils/formatters';

export default function Notificaciones() {
  const [data, setData] = useState([]);
  const [filtro, setFiltro] = useState('TODAS');
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await listarNotificaciones({ limit: 50 });
      setData(res.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const marcar = async (id) => {
    try {
      await marcarNotifLeida(id);
      toast.success('Notificacion marcada como leida');
      cargar();
    } catch { /* interceptor */ }
  };

  const visibles = data.filter(n => filtro === 'TODAS' ? true : (filtro === 'NOLEIDAS' ? n.EST_NOT !== 'LEIDA' : n.EST_NOT === 'LEIDA'));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notificaciones</h1>
          <p className="text-sm text-gray-500">{data.length} notificaciones</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFiltro('TODAS')} className={`btn ${filtro === 'TODAS' ? 'btn-primary' : 'btn-secondary'}`}>Todas</button>
          <button onClick={() => setFiltro('NOLEIDAS')} className={`btn ${filtro === 'NOLEIDAS' ? 'btn-primary' : 'btn-secondary'}`}>No leidas</button>
          <button onClick={() => setFiltro('LEIDAS')} className={`btn ${filtro === 'LEIDAS' ? 'btn-primary' : 'btn-secondary'}`}>Leidas</button>
        </div>
      </div>

      <div className="card divide-y">
        {loading && <div className="p-6 text-center text-gray-500">Cargando...</div>}
        {!loading && visibles.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            Sin notificaciones
          </div>
        )}
        {visibles.map(n => (
          <div key={n.ID_NOT} className="p-4 flex items-start gap-3 hover:bg-gray-50">
            <Bell className={`h-5 w-5 ${n.EST_NOT === 'LEIDA' ? 'text-gray-300' : 'text-primary-500'}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{n.ASU_NOT}</h3>
                <Badge className={n.EST_NOT === 'LEIDA' ? 'bg-gray-100 text-gray-600' : 'bg-primary-100 text-primary-700'}>
                  {n.EST_NOT}
                </Badge>
                <Badge className="bg-blue-100 text-blue-700">{n.TIP_NOT}</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{n.MEN_NOT}</p>
              <p className="text-xs text-gray-400 mt-1">{fmtFechaHora(n.FEC_GEN)}</p>
            </div>
            {n.EST_NOT !== 'LEIDA' && (
              <button onClick={() => marcar(n.ID_NOT)} title="Marcar como leida"
                className="text-gray-400 hover:text-primary-600">
                <Check className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
