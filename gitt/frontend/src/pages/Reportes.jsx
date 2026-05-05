import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { reporteInventario, reportePrestamosAct, reporteMantenim } from '@/api/catalogo.api';
import toast from 'react-hot-toast';

const reportes = [
  { id: 'inventario',         label: 'Inventario completo',       desc: 'Listado de todos los articulos activos',          fn: reporteInventario },
  { id: 'prestamos-activos',  label: 'Prestamos activos',         desc: 'Prestamos en curso pendientes de devolucion',     fn: reportePrestamosAct },
  { id: 'mantenimientos',     label: 'Historial de mantenimientos', desc: 'Todos los mantenimientos preventivos/correctivos', fn: reporteMantenim }
];

function descargarJSON(data, nombre) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nombre}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function descargarCSV(data, nombre) {
  if (!data || data.length === 0) return toast.error('Sin datos para exportar');
  const flat = data.map(r => JSON.parse(JSON.stringify(r)));
  const keys = Object.keys(flat[0]).filter(k => typeof flat[0][k] !== 'object');
  const csv = [
    keys.join(','),
    ...flat.map(r => keys.map(k => `"${(r[k] ?? '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nombre}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reportes() {
  const [loading, setLoading] = useState(null);

  const generar = async (rep, formato) => {
    setLoading(rep.id);
    try {
      const res = await rep.fn();
      const data = res.data.data || [];
      if (formato === 'json') descargarJSON(data, rep.id);
      else descargarCSV(data, rep.id);
      toast.success(`Reporte ${rep.label} descargado`);
    } catch { /* interceptor */ }
    finally { setLoading(null); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <p className="text-sm text-gray-500">Genere reportes y expongtalos en CSV o JSON</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportes.map(r => (
          <div key={r.id} className="card p-5 flex flex-col">
            <FileText className="h-8 w-8 text-primary-500 mb-2" />
            <h3 className="font-semibold text-gray-800">{r.label}</h3>
            <p className="text-sm text-gray-500 flex-1 mb-3">{r.desc}</p>
            <div className="flex gap-2">
              <button disabled={loading === r.id} onClick={() => generar(r, 'csv')}
                className="btn-secondary flex-1">
                <Download className="h-4 w-4" /> CSV
              </button>
              <button disabled={loading === r.id} onClick={() => generar(r, 'json')}
                className="btn-primary flex-1">
                <Download className="h-4 w-4" /> JSON
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
