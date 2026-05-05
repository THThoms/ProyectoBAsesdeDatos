const { Notificacion } = require('../models');
const { ok, notFound } = require('../utils/response');
const { getPagination, buildMeta } = require('../utils/pagination');

async function listar(req, res, next) {
  try {
    const pag = getPagination(req.query);
    const { rows, count } = await Notificacion.findAndCountAll({
      where: { ID_USU_DEST: req.user.id_usu },
      limit: pag.limit, offset: pag.offset, order: [['FEC_GEN', 'DESC']]
    });
    return ok(res, rows, 'Notificaciones', buildMeta(pag, count));
  } catch (err) { next(err); }
}

async function pendientes(req, res, next) {
  try {
    const data = await Notificacion.findAll({
      where: { ID_USU_DEST: req.user.id_usu, EST_NOT: { [require('sequelize').Op.ne]: 'LEIDA' } },
      order: [['FEC_GEN', 'DESC']], limit: 20
    });
    return ok(res, data);
  } catch (err) { next(err); }
}

async function marcarLeida(req, res, next) {
  try {
    const not = await Notificacion.findByPk(req.params.id);
    if (!not) return notFound(res, 'Notificacion no encontrada');
    not.EST_NOT = 'LEIDA';
    not.FEC_ENV = not.FEC_ENV || new Date();
    await not.save();
    return ok(res, not, 'Notificacion marcada como leida');
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const not = await Notificacion.findByPk(req.params.id);
    if (!not) return notFound(res, 'Notificacion no encontrada');
    await not.destroy();
    return ok(res, null, 'Notificacion eliminada');
  } catch (err) { next(err); }
}

module.exports = { listar, pendientes, marcarLeida, eliminar };
