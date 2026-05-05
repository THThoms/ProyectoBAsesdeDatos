import { useEffect, useMemo, useState } from 'react';
import { Plus, RotateCcw, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import PrestamoForm from '@/components/forms/PrestamoForm';
import {
  listarPrestamos, crearPrestamo, devolverPrestamo, cancelarPrestamo, obtenerPrestamo
} from '@/api/prestamo.api';
import { listarResponsables, listarArticulos } from '@/api/catalogo.api';
import { useAuthStore } from '@/store/authStore';
import { ROLES, COLORES_PRESTAMO } from '@/utils/constants';
import { fmtFecha } from '@/utils/formatters';

export default function Prestamos() {
  const { usuario } = useAuthStore();
  const esAdmin = usuario?.id_rol === ROLES.ADMINISTRADOR;
  const puedeCrear = esAdmin || usuario?.id_rol === ROLES.DOCENTE;

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [responsables, setResponsables] = useState([]);
  const [articulosDispon, setArticulosDispon] = useState([]);

  const [devolver, setDevolver] = useState({ open: false, prestamo: null });

  const cargar = async () => {
    setLoading(true);
    try {
      const params = { page, limit: meta.limit };
      if (filtroEstado) params.estado = filtroEstado;
      const res = await listarPrestamos(params);
      setData(res.data.data || []);
      setMeta(res.data.pagination || meta);
    } finally { setLoading(false); }
  };

  useEffect(() => { cargar(); /* eslint-disable-line */ }, [page, filtroEstado]);
  useEffect(() => {
    listarResponsables().then(r => setResponsables(r.data.data));
  }, []);

  const abrirCrear = async () => {
    const res = await listarArticulos({ estado: 1, limit: 100 });
    setArticulosDispon(res.data.data || []);
    setModalOpen(true);
  };

  const onCrear = async (form) => {
    try {
      await crearPrestamo(form);
      toast.success('Prestamo creado');
      setModalOpen(false);
      cargar();
    } catch { /* interceptor */ }
  };

  const abrirDevolver = async (id) => {
    const res = await obtenerPrestamo(id);
    setDevolver({ open: true, prestamo: res.data.data });
  };

  const onDevolver = async () => {
    const detalles = devolver.prestamo.detalles.map(d => ({
      ID_DET_PRE: d.ID_DET_PRE,
      EST_DEV: d.EST_DEV || 'BUENO',
      OBS_DET_PRE: d.OBS_DET_PRE
    }));
    try {
      await devolverPrestamo(devolver.prestamo.ID_PRE, detalles);
      toast.success('Devolucion registrada');
      setDevolver({ open: false, prestamo: null });
      cargar();
    } catch { /* interceptor */ }
  };

  const onCancelar = async (p) => {
    if (!confirm(`Cancelar prestamo #${p.ID_PRE}?`)) return;
    try {
      await cancelarPrestamo(p.ID_PRE);
      toast.success('Prestamo cancelado');
      cargar();
    } catch { /* interceptor */ }
  };

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'ID_PRE', cell: ({ getValue }) => `#${getValue()}` },
    { header: 'Responsable',
      accessorFn: r => r.responsable ? `${r.responsable.NOM_RESP} ${r.responsable.APE_RESP}` : '-', id: 'resp' },
    { header: 'Articulos', id: 'art', cell: ({ row }) => row.original.detalles?.length || 0 },
    { header: 'Fecha prestamo', accessorFn: r => fmtFecha(r.FEC_PRE), id: 'fp' },
    { header: 'Devolucion esperada',
      cell: ({ row }) => {
        const vencido = dayjs(row.original.FEC_DEV_PRO).isBefore(dayjs()) &&
          ['ACTIVO','VENCIDO'].includes(row.original.EST_PRE);
        return (
          <span className={vencido ? 'text-red-600 font-medium flex items-center gap-1' : ''}>
            {vencido && <AlertTriangle className="h-4 w-4" />}
            {fmtFecha(row.original.FEC_DEV_PRO)}
          </span>
        );
      }
    },
    { header: 'Estado', cell: ({ row }) => (
        <Badge className={COLORES_PRESTAMO[row.original.EST_PRE]}>{row.original.EST_PRE}</Badge>
      )
    },
    { header: 'Acciones', id: 'acc',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex gap-2">
            {['ACTIVO','VENCIDO','PENDIENTE'].includes(p.EST_PRE) && puedeCrear && (
              <button onClick={() => abrirDevolver(p.ID_PRE)} title="Registrar devolucion" className="text-gray-500 hover:text-primary-600">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            {esAdmin && p.EST_PRE !== 'DEVUELTO' && p.EST_PRE !== 'CANCELADO' && (
              <button onClick={() => onCancelar(p)} title="Cancelar" className="text-gray-500 hover:text-red-600">
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      }
    }
  ], [esAdmin, puedeCrear]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Prestamos</h1>
          <p className="text-sm text-gray-500">{meta.total || 0} prestamos registrados</p>
        </div>
        {puedeCrear && (
          <button onClick={abrirCrear} className="btn-primary">
            <Plus className="h-4 w-4" /> Nuevo prestamo
          </button>
        )}
      </div>

      <div className="card p-4 flex gap-3">
        <select className="input max-w-xs" value={filtroEstado} onChange={(e) => { setPage(1); setFiltroEstado(e.target.value); }}>
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="ACTIVO">Activo</option>
          <option value="VENCIDO">Vencido</option>
          <option value="DEVUELTO">Devuelto</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <DataTable data={data} columns={columns} loading={loading} pagination={meta} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="lg" title="Nuevo prestamo">
        <PrestamoForm responsables={responsables} articulos={articulosDispon}
          onSubmit={onCrear} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal open={devolver.open} onClose={() => setDevolver({ open: false, prestamo: null })} size="lg"
        title={`Devolucion - Prestamo #${devolver.prestamo?.ID_PRE}`}>
        {devolver.prestamo && (
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              Responsable: <strong>{devolver.prestamo.responsable?.NOM_RESP} {devolver.prestamo.responsable?.APE_RESP}</strong>
            </div>
            <div>
              <h4 className="font-medium mb-2">Articulos a devolver</h4>
              <div className="space-y-2">
                {devolver.prestamo.detalles.map((d, i) => (
                  <div key={d.ID_DET_PRE} className="border rounded p-3">
                    <div className="font-medium text-sm">{d.articulo?.NOM_ART} ({d.articulo?.COD_INS})</div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <select className="input"
                        value={d.EST_DEV || 'BUENO'}
                        onChange={(e) => {
                          const copia = { ...devolver.prestamo };
                          copia.detalles[i].EST_DEV = e.target.value;
                          setDevolver({ ...devolver, prestamo: copia });
                        }}>
                        <option value="BUENO">Buen estado</option>
                        <option value="REGULAR">Regular</option>
                        <option value="DANADO">Danado</option>
                      </select>
                      <input className="input" placeholder="Observacion (opcional)"
                        onChange={(e) => {
                          const copia = { ...devolver.prestamo };
                          copia.detalles[i].OBS_DET_PRE = e.target.value;
                          setDevolver({ ...devolver, prestamo: copia });
                        }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setDevolver({ open: false, prestamo: null })} className="btn-secondary">Cancelar</button>
              <button onClick={onDevolver} className="btn-primary">Confirmar devolucion</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
