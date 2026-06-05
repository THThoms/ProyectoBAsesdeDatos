const { Movimiento, Articulo, Ubicacion, EstadoArticulo, Usuario, sequelize } = require('../models');
const { ok, created } = require('../utils/response');
const { getPagination, buildMeta } = require('../utils/pagination');

const includeMov = [
  { model: Articulo,       as: 'articulo' },
  { model: Ubicacion,      as: 'ubicacionOrigen' },
  { model: Ubicacion,      as: 'ubicacionDestino' },
  { model: EstadoArticulo, as: 'estadoAnterior' },
  { model: EstadoArticulo, as: 'estadoNuevo' },
  { model: Usuario,        as: 'usuario', attributes: ['ID_USU','NOM_USU','APE_USU'] }
];

async function listar(req, res, next) {
  try {
    const pag = getPagination(req.query);
    const where = {};
    if (req.query.tipo)     where.TIP_MOV = req.query.tipo;
    if (req.query.articulo) where.ID_ART  = req.query.articulo;

    const { rows, count } = await Movimiento.findAndCountAll({
      where, include: includeMov, limit: pag.limit, offset: pag.offset,
      order: [['FEC_MOV', 'DESC']]
    });
    return ok(res, rows, 'Movimientos', buildMeta(pag, count));
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const mov = await sequelize.transaction(async (t) => {
      const m = await Movimiento.create({
        ...req.body, ID_USU: req.user.id_usu, FEC_MOV: req.body.FEC_MOV || new Date()
      }, { transaction: t });
      const articulo = await Articulo.findByPk(m.ID_ART, { transaction: t });
      if (articulo) {
        if (m.ID_UBI_DES) articulo.ID_UBI = m.ID_UBI_DES;
        if (m.ID_EST_NUE) articulo.ID_EST = m.ID_EST_NUE;
        await articulo.save({ transaction: t });
      }
      return m;
    });
    res.locals.createdId = mov.ID_MOV;
    return created(res, mov, 'Movimiento registrado');
  } catch (err) { next(err); }
}

async function porArticulo(req, res, next) {
  try {
    const data = await Movimiento.findAll({
      where: { ID_ART: req.params.id }, include: includeMov, order: [['FEC_MOV', 'DESC']]
    });
    return ok(res, data);
  } catch (err) { next(err); }
}

module.exports = { listar, crear, porArticulo };
