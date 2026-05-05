import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, History } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import ArticuloForm from '@/components/forms/ArticuloForm';
import {
  listarArticulos, crearArticulo, actualizarArticulo, eliminarArticulo, historialArticulo
} from '@/api/articulo.api';
import { listarCategorias, listarEstados, listarUbicaciones, listarResponsables } from '@/api/catalogo.api';
import { useAuthStore } from '@/store/authStore';
import { ROLES, COLORES_ESTADO } from '@/utils/constants';
import { fmtFechaHora } from '@/utils/formatters';

export default function Inventario() {
  const { usuario } = useAuthStore();
  const esAdmin = usuario?.id_rol === ROLES.ADMINISTRADOR;
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({ search: '', categoria: '', estado: '', ubicacion: '' });
  const [page, setPage] = useState(1);
  const [catalogos, setCatalogos] = useState({ categorias: [], estados: [], ubicaciones: [], responsables: [] });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [historial, setHistorial] = useState({ open: false, items: [] });

  const cargar = async () => {
    setLoading(true);
    try {
      const params = { page, limit: meta.limit, ...filtros };
      Object.keys(params).forEach(k => params[k] === '' && delete params[k]);
      const res = await listarArticulos(params);
      setData(res.data.data || []);
      setMeta(res.data.pagination || meta);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    Promise.all([listarCategorias(), listarEstados(), listarUbicaciones(), listarResponsables()])
      .then(([c, e, u, r]) => setCatalogos({
        categorias: c.data.data, estados: e.data.data,
        ubicaciones: u.data.data, responsables: r.data.data
      }));
  }, []);

  useEffect(() => { cargar(); /* eslint-disable-line */ }, [page, filtros]);

  const columns = useMemo(() => [
    { header: 'Codigo',     accessorKey: 'COD_INS', cell: ({ row }) => row.original.COD_INS || row.original.COD_BAR || '-' },
    { header: 'Nombre',     accessorKey: 'NOM_ART' },
    { header: 'Categoria',  accessorFn: r => r.categoria?.NOM_CAT, id: 'cat' },
    { header: 'Estado',     id: 'est',
      cell: ({ row }) => {
        const nom = row.original.estado?.NOM_EST;
        return <Badge className={COLORES_ESTADO[nom] || 'bg-gray-100 text-gray-700'}>{nom}</Badge>;
      }
    },
    { header: 'Ubicacion',   accessorFn: r => r.ubicacion?.NOM_UBI, id: 'ubi' },
    { header: 'Responsable', accessorFn: r => r.responsable ? `${r.responsable.NOM_RESP} ${r.responsable.APE_RESP}` : '-', id: 'resp' },
    { header: 'Acciones', id: 'acc',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => verHistorial(row.original.ID_ART)} title="Historial" className="text-gray-500 hover:text-primary-600">
            <History className="h-4 w-4" />
          </button>
          {esAdmin && <>
            <button onClick={() => { setEditing(row.original); setModalOpen(true); }} title="Editar" className="text-gray-500 hover:text-primary-600">
              <Edit className="h-4 w-4" />
            </button>
            <button onClick={() => onEliminar(row.original)} title="Dar de baja" className="text-gray-500 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </>}
        </div>
      )
    }
  ], [esAdmin]);

  const verHistorial = async (id) => {
    const res = await historialArticulo(id);
    setHistorial({ open: true, items: res.data.data || [] });
  };

  const onSubmit = async (formData) => {
    try {
      if (editing) await actualizarArticulo(editing.ID_ART, formData);
      else await crearArticulo(formData);
      toast.success(editing ? 'Articulo actualizado' : 'Articulo creado');
      setModalOpen(false); setEditing(null);
      cargar();
    } catch { /* interceptor */ }
  };

  const onEliminar = async (a) => {
    if (!confirm(`Dar de baja "${a.NOM_ART}"?`)) return;
    try {
      await eliminarArticulo(a.ID_ART);
      toast.success('Articulo dado de baja');
      cargar();
    } catch { /* interceptor */ }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
          <p className="text-sm text-gray-500">{meta.total || 0} articulos registrados</p>
        </div>
        {esAdmin && (
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
            <Plus className="h-4 w-4" /> Nuevo articulo
          </button>
        )}
      </div>

      <div className="card p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input className="input pl-10" placeholder="Buscar por nombre, codigo, marca..."
            onChange={(e) => { setPage(1); setFiltros({ ...filtros, search: e.target.value }); }} />
        </div>
        <select className="input" onChange={(e) => { setPage(1); setFiltros({ ...filtros, categoria: e.target.value }); }}>
          <option value="">Todas las categorias</option>
          {catalogos.categorias.map(c => <option key={c.ID_CAT} value={c.ID_CAT}>{c.NOM_CAT}</option>)}
        </select>
        <select className="input" onChange={(e) => { setPage(1); setFiltros({ ...filtros, estado: e.target.value }); }}>
          <option value="">Todos los estados</option>
          {catalogos.estados.map(e2 => <option key={e2.ID_EST} value={e2.ID_EST}>{e2.NOM_EST}</option>)}
        </select>
        <select className="input" onChange={(e) => { setPage(1); setFiltros({ ...filtros, ubicacion: e.target.value }); }}>
          <option value="">Todas las ubicaciones</option>
          {catalogos.ubicaciones.map(u => <option key={u.ID_UBI} value={u.ID_UBI}>{u.NOM_UBI}</option>)}
        </select>
      </div>

      <DataTable
        data={data} columns={columns} loading={loading}
        pagination={meta} onPageChange={setPage}
        emptyText="No hay articulos que coincidan con los filtros"
      />

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} size="lg"
        title={editing ? 'Editar articulo' : 'Nuevo articulo'}>
        <ArticuloForm catalogos={catalogos} initial={editing} onSubmit={onSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal open={historial.open} onClose={() => setHistorial({ open: false, items: [] })} size="lg" title="Historial de movimientos">
        {historial.items.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin movimientos registrados</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {historial.items.map(m => (
              <li key={m.ID_MOV} className="border-b pb-2">
                <div className="font-medium">{m.TIP_MOV} - {fmtFechaHora(m.FEC_MOV)}</div>
                <div className="text-gray-500">{m.DES_MOV}</div>
                {(m.ubicacionOrigen || m.ubicacionDestino) && (
                  <div className="text-xs text-gray-400">
                    {m.ubicacionOrigen?.NOM_UBI || '-'} {' -> '} {m.ubicacionDestino?.NOM_UBI || '-'}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
