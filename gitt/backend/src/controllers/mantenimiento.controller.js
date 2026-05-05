const { Mantenimiento, Articulo, sequelize } = require('../models');
const { ESTADOS_ARTICULO } = require('../utils/constants');
const { ok, created, notFound } = require('../utils/response');
const { getPagination, buildMeta } = require('../utils/pagination');

async function listar(req, res, next) {
  try {
    const pag = getPagination(req.query);
    const { rows, count } = await Mantenimiento.findAndCountAll({
      include: [{ model: Articulo, as: 'articulo' }],
      limit: pag.limit, offset: pag.offset, order: [['FEC_INI', 'DESC']]
    });
    return ok(res, rows, 'Mantenimientos', buildMeta(pag, count));
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const mant = await sequelize.transaction(async (t) => {
      const m = await Mantenimiento.create({
        ...req.body, ID_USU: req.user.id_usu, FEC_INI: req.body.FEC_INI || new Date()
      }, { transaction: t });

      if (!m.FEC_FIN) {
        const articulo = await Articulo.findByPk(m.ID_ART, { transaction: t });
        if (articulo) {
          articulo.ID_EST = ESTADOS_ARTICULO.EN_MANTENIMIENTO;
          await articulo.save({ transaction: t });
        }
      }
      return m;
    });
    res.locals.createdId = mant.ID_MAN;
    return created(res, mant, 'Mantenimiento registrado');
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const mant = await sequelize.transaction(async (t) => {
      const m = await Mantenimiento.findByPk(req.params.id, { transaction: t });
      if (!m) throw Object.assign(new Error('Mantenimiento no encontrado'), { statusCode: 404 });
      await m.update(req.body, { transaction: t });

      if (req.body.FEC_FIN) {
        const articulo = await Articulo.findByPk(m.ID_ART, { transaction: t });
        if (articulo && articulo.ID_EST === ESTADOS_ARTICULO.EN_MANTENIMIENTO) {
          articulo.ID_EST = ESTADOS_ARTICULO.DISPONIBLE;
          await articulo.save({ transaction: t });
        }
      }
      return m;
    });
    return ok(res, mant, 'Mantenimiento actualizado');
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const m = await Mantenimiento.findByPk(req.params.id);
    if (!m) return notFound(res, 'Mantenimiento no encontrado');
    await m.destroy();
    return ok(res, null, 'Mantenimiento eliminado');
  } catch (err) { next(err); }
}

module.exports = { listar, crear, actualizar, eliminar };
