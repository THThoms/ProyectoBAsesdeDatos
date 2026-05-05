import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function PrestamoForm({ responsables, articulos, onSubmit, onCancel }) {
  const [paso, setPaso] = useState(1);
  const [data, setData] = useState({
    ID_RESP:     '',
    FEC_DEV_PRO: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    OBS_PRE:     '',
    articulos:   []
  });
  const [busqueda, setBusqueda] = useState('');

  const filtrados = articulos.filter(a =>
    !data.articulos.find(x => x.ID_ART === a.ID_ART) &&
    (a.NOM_ART?.toLowerCase().includes(busqueda.toLowerCase()) ||
     a.COD_INS?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const agregar = (a) => {
    setData(d => ({ ...d, articulos: [...d.articulos, { ID_ART: a.ID_ART, NOM_ART: a.NOM_ART, COD_INS: a.COD_INS, EST_ENT: 'BUENO' }] }));
  };
  const quitar = (id) => setData(d => ({ ...d, articulos: d.articulos.filter(x => x.ID_ART !== id) }));

  const submit = () => {
    if (!data.ID_RESP) return toast.error('Seleccione un responsable');
    if (data.articulos.length === 0) return toast.error('Agregue al menos un articulo');
    onSubmit({
      ID_RESP:     Number(data.ID_RESP),
      FEC_DEV_PRO: data.FEC_DEV_PRO,
      OBS_PRE:     data.OBS_PRE || undefined,
      articulos:   data.articulos.map(a => ({ ID_ART: a.ID_ART, EST_ENT: a.EST_ENT }))
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-xs">
        <span className={`px-3 py-1 rounded-full ${paso === 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>1. Datos generales</span>
        <span className={`px-3 py-1 rounded-full ${paso === 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>2. Articulos</span>
      </div>

      {paso === 1 && (
        <div className="space-y-3">
          <div>
            <label className="label">Responsable *</label>
            <select className="input" value={data.ID_RESP} onChange={(e) => setData({ ...data, ID_RESP: e.target.value })}>
              <option value="">-- Seleccione --</option>
              {responsables.map(r => (
                <option key={r.ID_RESP} value={r.ID_RESP}>{r.NOM_RESP} {r.APE_RESP} ({r.TIP_RESP})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Fecha de devolucion programada *</label>
            <input type="date" className="input" value={data.FEC_DEV_PRO} min={dayjs().format('YYYY-MM-DD')}
              onChange={(e) => setData({ ...data, FEC_DEV_PRO: e.target.value })} />
          </div>
          <div>
            <label className="label">Observaciones</label>
            <textarea className="input" rows="2" value={data.OBS_PRE} onChange={(e) => setData({ ...data, OBS_PRE: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={onCancel} className="btn-secondary">Cancelar</button>
            <button onClick={() => setPaso(2)} className="btn-primary"
              disabled={!data.ID_RESP || !data.FEC_DEV_PRO}>Siguiente</button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="space-y-3">
          <div>
            <label className="label">Buscar articulos disponibles</label>
            <input className="input" placeholder="Nombre o codigo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            {busqueda && (
              <ul className="border rounded mt-2 max-h-48 overflow-y-auto divide-y">
                {filtrados.slice(0, 20).map(a => (
                  <li key={a.ID_ART} className="px-3 py-2 flex justify-between items-center text-sm hover:bg-gray-50">
                    <div>
                      <div className="font-medium">{a.NOM_ART}</div>
                      <div className="text-xs text-gray-500">{a.COD_INS} - {a.MAR_ART}</div>
                    </div>
                    <button onClick={() => agregar(a)} className="text-primary-600 hover:text-primary-800">
                      <Plus className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {filtrados.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">Sin resultados</li>}
              </ul>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Articulos seleccionados ({data.articulos.length})</h4>
            {data.articulos.length === 0 ? (
              <p className="text-sm text-gray-500">Aun no hay articulos seleccionados</p>
            ) : (
              <ul className="border rounded divide-y">
                {data.articulos.map(a => (
                  <li key={a.ID_ART} className="px-3 py-2 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-medium">{a.NOM_ART}</div>
                      <div className="text-xs text-gray-500">{a.COD_INS}</div>
                    </div>
                    <button onClick={() => quitar(a.ID_ART)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-between pt-2 border-t">
            <button onClick={() => setPaso(1)} className="btn-secondary">Anterior</button>
            <div className="flex gap-2">
              <button onClick={onCancel} className="btn-secondary">Cancelar</button>
              <button onClick={submit} className="btn-primary" disabled={data.articulos.length === 0}>
                Crear prestamo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
