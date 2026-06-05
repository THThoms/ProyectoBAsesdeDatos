const { Op } = require('sequelize');
const { Auditoria, Usuario } = require('../models');
const { ok } = require('../utils/response');
const { getPagination, buildMeta } = require('../utils/pagination');

async function listar(req, res, next) {
  try {
    const pag = getPagination(req.query);
    const where = {};
    if (req.query.tabla)   where.TAB_AUD = req.query.tabla;
    if (req.query.accion)  where.ACC_AUD = req.query.accion;
    if (req.query.usuario) where.ID_USU  = req.query.usuario;
    if (req.query.desde && req.query.hasta) {
      where.FEC_HOR = { [Op.between]: [req.query.desde, req.query.hasta] };
    }
    const { rows, count } = await Auditoria.findAndCountAll({
      where,
      include: [{ model: Usuario, as: 'usuario', attributes: ['ID_USU','NOM_USU','APE_USU','COR_USU'] }],
      limit: pag.limit, offset: pag.offset, order: [['FEC_HOR', 'DESC']]
    });
    return ok(res, rows, 'Auditoria', buildMeta(pag, count));
  } catch (err) { next(err); }
}

module.exports = { listar };
