import { useEffect, useMemo, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { listarAuditoria } from '@/api/catalogo.api';
import { fmtFechaHora } from '@/utils/formatters';

const COLOR_ACC = {
  INSERT: 'bg-green-100 text-green-800',
  UPDATE: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN:  'bg-blue-100 text-blue-800',
  LOGOUT: 'bg-gray-100 text-gray-700'
};

export default function Auditoria() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState({ tabla: '', accion: '' });
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const params = { page, limit: meta.limit };
      if (filtros.tabla)  params.tabla = filtros.tabla;
      if (filtros.accion) params.accion = filtros.accion;
      const res = await listarAuditoria(params);
      setData(res.data.data || []);
      setMeta(res.data.pagination || meta);
    } finally { setLoading(false); }
  };

  useEffect(() => { cargar(); /* eslint-disable-line */ }, [page, filtros]);

  const columns = useMemo(() => [
    { header: 'Fecha/Hora',     accessorFn: r => fmtFechaHora(r.FEC_HOR), id: 'fec' },
    { header: 'Accion', cell: ({ row }) => (
        <Badge className={COLOR_ACC[row.original.ACC_AUD]}>{row.original.ACC_AUD}</Badge>
      )
    },
    { header: 'Tabla',          accessorKey: 'TAB_AUD' },
    { header: 'ID Registro',    accessorKey: 'ID_REG_AUD' },
    { header: 'Descripcion',    accessorKey: 'DES_AUD' },
    { header: 'IP',             accessorKey: 'IP_EQU' },
    { header: 'Usuario', accessorFn: r => r.usuario ? `${r.usuario.NOM_USU} ${r.usuario.APE_USU}` : `#${r.ID_USU}`, id: 'usu' }
  ], []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Auditoria</h1>

      <div className="card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="input" placeholder="Tabla (ej. ARTICULO)"
          onChange={(e) => { setPage(1); setFiltros({ ...filtros, tabla: e.target.value.toUpperCase() }); }} />
        <select className="input" onChange={(e) => { setPage(1); setFiltros({ ...filtros, accion: e.target.value }); }}>
          <option value="">Todas las acciones</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
        </select>
      </div>

      <DataTable data={data} columns={columns} loading={loading} pagination={meta} onPageChange={setPage} />
    </div>
  );
}
