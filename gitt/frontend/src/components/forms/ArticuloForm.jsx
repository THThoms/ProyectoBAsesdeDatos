import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  NOM_ART: z.string().min(2, 'Requerido').max(60),
  COD_INS: z.string().max(30).optional().or(z.literal('')),
  COD_BAR: z.string().max(30).optional().or(z.literal('')),
  MAR_ART: z.string().max(30).optional().or(z.literal('')),
  MOD_ART: z.string().max(30).optional().or(z.literal('')),
  SER_ART: z.string().max(40).optional().or(z.literal('')),
  DES_ART: z.string().max(200).optional().or(z.literal('')),
  IMG_ART: z.string().max(120).optional().or(z.literal('')),
  ID_CAT:  z.coerce.number().int().positive('Seleccione una categoria'),
  ID_EST:  z.coerce.number().int().positive('Seleccione un estado'),
  ID_UBI:  z.coerce.number().int().positive('Seleccione una ubicacion'),
  ID_RESP: z.coerce.number().int().positive().optional().or(z.literal(''))
});

export default function ArticuloForm({ catalogos, initial, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial || {}
  });

  const submit = (d) => {
    const data = { ...d };
    Object.keys(data).forEach(k => data[k] === '' && delete data[k]);
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="label">Nombre *</label>
        <input className="input" {...register('NOM_ART')} />
        {errors.NOM_ART && <p className="text-xs text-red-600 mt-1">{errors.NOM_ART.message}</p>}
      </div>
      <div>
        <label className="label">Codigo institucional</label>
        <input className="input" {...register('COD_INS')} />
      </div>
      <div>
        <label className="label">Codigo de barras</label>
        <input className="input" {...register('COD_BAR')} />
      </div>
      <div>
        <label className="label">Marca</label>
        <input className="input" {...register('MAR_ART')} />
      </div>
      <div>
        <label className="label">Modelo</label>
        <input className="input" {...register('MOD_ART')} />
      </div>
      <div>
        <label className="label">Serie</label>
        <input className="input" {...register('SER_ART')} />
      </div>
      <div>
        <label className="label">Imagen (URL/ruta)</label>
        <input className="input" {...register('IMG_ART')} />
      </div>
      <div>
        <label className="label">Categoria *</label>
        <select className="input" {...register('ID_CAT')}>
          <option value="">-- Seleccione --</option>
          {catalogos.categorias.map(c => <option key={c.ID_CAT} value={c.ID_CAT}>{c.NOM_CAT}</option>)}
        </select>
        {errors.ID_CAT && <p className="text-xs text-red-600 mt-1">{errors.ID_CAT.message}</p>}
      </div>
      <div>
        <label className="label">Estado *</label>
        <select className="input" {...register('ID_EST')}>
          <option value="">-- Seleccione --</option>
          {catalogos.estados.map(e => <option key={e.ID_EST} value={e.ID_EST}>{e.NOM_EST}</option>)}
        </select>
        {errors.ID_EST && <p className="text-xs text-red-600 mt-1">{errors.ID_EST.message}</p>}
      </div>
      <div>
        <label className="label">Ubicacion *</label>
        <select className="input" {...register('ID_UBI')}>
          <option value="">-- Seleccione --</option>
          {catalogos.ubicaciones.map(u => <option key={u.ID_UBI} value={u.ID_UBI}>{u.NOM_UBI}</option>)}
        </select>
        {errors.ID_UBI && <p className="text-xs text-red-600 mt-1">{errors.ID_UBI.message}</p>}
      </div>
      <div>
        <label className="label">Responsable</label>
        <select className="input" {...register('ID_RESP')}>
          <option value="">(opcional)</option>
          {catalogos.responsables.map(r => <option key={r.ID_RESP} value={r.ID_RESP}>{r.NOM_RESP} {r.APE_RESP}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="label">Descripcion</label>
        <textarea className="input" rows="2" {...register('DES_ART')}></textarea>
      </div>
      <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {initial ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
