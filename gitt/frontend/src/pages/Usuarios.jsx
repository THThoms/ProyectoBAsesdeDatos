import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import api from '@/api/axios';
import { listarUsuarios, listarRoles } from '@/api/catalogo.api';

export default function Usuarios() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ NOM_USU: '', APE_USU: '', COR_USU: '', CLA_USU: '', ID_ROL: '' });

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await listarUsuarios();
      setData(res.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { cargar(); listarRoles().then(r => setRoles(r.data.data)); }, []);

  const submit = async () => {
    try {
      await api.post('/usuarios', { ...form, ID_ROL: Number(form.ID_ROL) });
      toast.success('Usuario creado');
      setOpen(false);
      setForm({ NOM_USU: '', APE_USU: '', COR_USU: '', CLA_USU: '', ID_ROL: '' });
      cargar();
    } catch { /* interceptor */ }
  };

  const inactivar = async (u) => {
    if (!confirm(`Inactivar a ${u.NOM_USU} ${u.APE_USU}?`)) return;
    try {
      await api.delete(`/usuarios/${u.ID_USU}`);
      toast.success('Usuario inactivado');
      cargar();
    } catch { /* interceptor */ }
  };

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'ID_USU' },
    { header: 'Nombre', accessorFn: r => `${r.NOM_USU} ${r.APE_USU}`, id: 'nom' },
    { header: 'Correo', accessorKey: 'COR_USU' },
    { header: 'Rol', accessorFn: r => r.rol?.NOM_ROL, id: 'rol' },
    { header: 'Estado', cell: ({ row }) => (
        <Badge className={row.original.EST_USU === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}>
          {row.original.EST_USU}
        </Badge>
      )
    },
    { header: 'Acciones', id: 'acc',
      cell: ({ row }) => (
        row.original.EST_USU === 'ACTIVO' && (
          <button onClick={() => inactivar(row.original)} className="text-red-600 hover:text-red-800 text-sm">
            Inactivar
          </button>
        )
      )
    }
  ], []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Nuevo usuario</button>
      </div>

      <DataTable data={data} columns={columns} loading={loading} />

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo usuario">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><label className="label">Nombre</label><input className="input" value={form.NOM_USU} onChange={(e) => setForm({ ...form, NOM_USU: e.target.value })} /></div>
          <div><label className="label">Apellido</label><input className="input" value={form.APE_USU} onChange={(e) => setForm({ ...form, APE_USU: e.target.value })} /></div>
          <div className="md:col-span-2"><label className="label">Correo</label><input type="email" className="input" value={form.COR_USU} onChange={(e) => setForm({ ...form, COR_USU: e.target.value })} /></div>
          <div className="md:col-span-2"><label className="label">Contrasena</label><input type="password" className="input" value={form.CLA_USU} onChange={(e) => setForm({ ...form, CLA_USU: e.target.value })} /></div>
          <div className="md:col-span-2">
            <label className="label">Rol</label>
            <select className="input" value={form.ID_ROL} onChange={(e) => setForm({ ...form, ID_ROL: e.target.value })}>
              <option value="">-- Seleccione --</option>
              {roles.map(r => <option key={r.ID_ROL} value={r.ID_ROL}>{r.NOM_ROL}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t">
            <button onClick={() => setOpen(false)} className="btn-secondary">Cancelar</button>
            <button onClick={submit} className="btn-primary">Crear</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
