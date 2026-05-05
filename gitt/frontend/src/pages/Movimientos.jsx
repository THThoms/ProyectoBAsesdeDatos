import { useEffect, useMemo, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { listarMovimientos } from '@/api/catalogo.api';
import { fmtFechaHora } from '@/utils/formatters';

export default function Movimientos() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [tipo, setTipo] = useState('');
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const params = { page, limit: meta.limit };
      if (tipo) params.tipo = tipo;
      const res = await listarMovimientos(params);
      setData(res.data.data || []);
      setMeta(res.data.pagination || meta);
    } finally { setLoading(false); }
  };

  useEffect(() => { cargar(); /* eslint-disable-line */ }, [page, tipo]);

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'ID_MOV', cell: ({ getValue }) => `#${getValue()}` },
    { header: 'Fecha', accessorFn: r => fmtFechaHora(r.FEC_MOV), id: 'fec' },
    { header: 'Tipo', accessorKey: 'TIP_MOV' },
    { header: 'Articulo', accessorFn: r => r.articulo?.NOM_ART, id: 'art' },
    { header: 'Origen',  accessorFn: r => r.ubicacionOrigen?.NOM_UBI || '-', id: 'org' },
    { header: 'Destino', accessorFn: r => r.ubicacionDestino?.NOM_UBI || '-', id: 'des' },
    { header: 'Estado anterior', accessorFn: r => r.estadoAnterior?.NOM_EST || '-', id: 'ea' },
    { header: 'Estado nuevo',    accessorFn: r => r.estadoNuevo?.NOM_EST || '-', id: 'en' },
    { header: 'Usuario', accessorFn: r => r.usuario ? `${r.usuario.NOM_USU} ${r.usuario.APE_USU}` : '-', id: 'usu' }
  ], []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Movimientos</h1>

      <div className="card p-4">
        <select className="input max-w-xs" value={tipo} onChange={(e) => { setPage(1); setTipo(e.target.value); }}>
          <option value="">Todos los tipos</option>
          <option value="REGISTRO">Registro</option>
          <option value="TRASLADO">Traslado</option>
          <option value="PRESTAMO">Prestamo</option>
          <option value="DEVOLUCION">Devolucion</option>
          <option value="MANTENIMIENTO">Mantenimiento</option>
          <option value="BAJA">Baja</option>
        </select>
      </div>

      <DataTable data={data} columns={columns} loading={loading} pagination={meta} onPageChange={setPage} />
    </div>
  );
}
