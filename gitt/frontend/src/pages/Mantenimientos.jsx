import { useEffect, useMemo, useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { listarMantenimientos, crearMantenimiento, cerrarMantenimiento, listarArticulos } from '@/api/catalogo.api';
import { fmtFecha, fmtMoneda } from '@/utils/formatters';
import { useAuthStore } from '@/store/authStore';
import { ROLES } from '@/utils/constants';

export default function Mantenimientos() {
  const { usuario } = useAuthStore();
  const esAdmin = usuario?.id_rol === ROLES.ADMINISTRADOR;
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [articulos, setArticulos] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ TIP_MAN: 'PREVENTIVO', FEC_INI: '', DES_MAN: '', COS_MAN: '', PRO_TEC: '', ID_ART: '' });

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await listarMantenimientos({ page, limit: meta.limit });
      setData(res.data.data || []);
      setMeta(res.data.pagination || meta);
    } finally { setLoading(false); }
  };

  useEffect(() => { cargar(); /* eslint-disable-line */ }, [page]);
  useEffect(() => { listarArticulos({ limit: 200 }).then(r => setArticulos(r.data.data)); }, []);

  const cerrar = async (m) => {
    if (!confirm('Cerrar mantenimiento?')) return;
    try {
      await cerrarMantenimiento(m.ID_MAN, { FEC_FIN: new Date().toISOString().split('T')[0], RES_MAN: 'COMPLETADO' });
      toast.success('Mantenimiento cerrado');
      cargar();
    } catch { /* interceptor */ }
  };

  const submit = async () => {
    try {
      const data = { ...form, ID_ART: Number(form.ID_ART), COS_MAN: form.COS_MAN ? Number(form.COS_MAN) : undefined };
      if (!data.ID_ART) return toast.error('Seleccione un articulo');
      await crearMantenimiento(data);
      toast.success('Mantenimiento registrado');
      setOpen(false);
      cargar();
    } catch { /* interceptor */ }
  };

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'ID_MAN', cell: ({ getValue }) => `#${getValue()}` },
    { header: 'Tipo', accessorKey: 'TIP_MAN' },
    { header: 'Articulo', accessorFn: r => r.articulo?.NOM_ART, id: 'art' },
    { header: 'Inicio',  accessorFn: r => fmtFecha(r.FEC_INI), id: 'fi' },
    { header: 'Fin',     accessorFn: r => fmtFecha(r.FEC_FIN), id: 'ff' },
    { header: 'Costo',   accessorFn: r => fmtMoneda(r.COS_MAN), id: 'co' },
    { header: 'Tecnico', accessorKey: 'PRO_TEC' },
    { header: 'Acciones', id: 'acc',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {esAdmin && !row.original.FEC_FIN && (
            <button onClick={() => cerrar(row.original)} title="Cerrar" className="text-gray-500 hover:text-green-600">
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ], [esAdmin]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Mantenimientos</h1>
        {esAdmin && <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Nuevo</button>}
      </div>

      <DataTable data={data} columns={columns} loading={loading} pagination={meta} onPageChange={setPage} />

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar mantenimiento">
        <div className="space-y-3">
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={form.TIP_MAN} onChange={(e) => setForm({ ...form, TIP_MAN: e.target.value })}>
              <option value="PREVENTIVO">Preventivo</option>
              <option value="CORRECTIVO">Correctivo</option>
            </select>
          </div>
          <div>
            <label className="label">Articulo *</label>
            <select className="input" value={form.ID_ART} onChange={(e) => setForm({ ...form, ID_ART: e.target.value })}>
              <option value="">-- Seleccione --</option>
              {articulos.map(a => <option key={a.ID_ART} value={a.ID_ART}>{a.NOM_ART} ({a.COD_INS})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Fecha inicio *</label>
            <input type="date" className="input" value={form.FEC_INI}
              onChange={(e) => setForm({ ...form, FEC_INI: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Costo</label>
              <input type="number" step="0.01" className="input" value={form.COS_MAN}
                onChange={(e) => setForm({ ...form, COS_MAN: e.target.value })} />
            </div>
            <div>
              <label className="label">Tecnico/Proveedor</label>
              <input className="input" value={form.PRO_TEC}
                onChange={(e) => setForm({ ...form, PRO_TEC: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Descripcion</label>
            <textarea className="input" rows="2" value={form.DES_MAN}
              onChange={(e) => setForm({ ...form, DES_MAN: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={() => setOpen(false)} className="btn-secondary">Cancelar</button>
            <button onClick={submit} className="btn-primary">Registrar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
