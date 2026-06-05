const { Rol, Categoria, EstadoArticulo, Departamento, Ubicacion, Responsable } = require('../models');
const { ok, created } = require('../utils/response');

const factory = (Model, name) => ({
  list: async (req, res, next) => {
    try { return ok(res, await Model.findAll({ order: [[`NOM_${name}`, 'ASC']] })); }
    catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try {
      const item = await Model.create(req.body);
      res.locals.createdId = item[`ID_${name}`];
      return created(res, item);
    } catch (err) { next(err); }
  },
  update: async (req, res, next) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'No encontrado' });
      await item.update(req.body);
      return ok(res, item);
    } catch (err) { next(err); }
  },
  remove: async (req, res, next) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'No encontrado' });
      await item.destroy();
      return ok(res, null, 'Eliminado');
    } catch (err) { next(err); }
  }
});

module.exports = {
  roles:           factory(Rol,             'ROL'),
  categorias:      factory(Categoria,       'CAT'),
  estados:         factory(EstadoArticulo,  'EST'),
  departamentos:   factory(Departamento,    'DEP'),
  ubicaciones:     factory(Ubicacion,       'UBI'),
  responsables: {
    list: async (req, res, next) => {
      try { return ok(res, await Responsable.findAll({ order: [['NOM_RESP', 'ASC']] })); }
      catch (err) { next(err); }
    },
    create: async (req, res, next) => {
      try {
        const r = await Responsable.create(req.body);
        res.locals.createdId = r.ID_RESP;
        return created(res, r);
      } catch (err) { next(err); }
    },
    update: async (req, res, next) => {
      try {
        const r = await Responsable.findByPk(req.params.id);
        if (!r) return res.status(404).json({ success: false, message: 'No encontrado' });
        await r.update(req.body);
        return ok(res, r);
      } catch (err) { next(err); }
    },
    remove: async (req, res, next) => {
      try {
        const r = await Responsable.findByPk(req.params.id);
        if (!r) return res.status(404).json({ success: false, message: 'No encontrado' });
        await r.destroy();
        return ok(res, null, 'Eliminado');
      } catch (err) { next(err); }
    }
  }
};
