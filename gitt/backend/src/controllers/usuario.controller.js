const { Usuario, Rol } = require('../models');
const authService = require('../services/auth.service');
const { ok, created, notFound } = require('../utils/response');
const { getPagination, buildMeta } = require('../utils/pagination');

async function listar(req, res, next) {
  try {
    const pag = getPagination(req.query);
    const { rows, count } = await Usuario.findAndCountAll({
      include: [{ model: Rol, as: 'rol' }],
      limit: pag.limit, offset: pag.offset, order: [['ID_USU', 'ASC']]
    });
    return ok(res, rows, 'Usuarios', buildMeta(pag, count));
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const data = { ...req.body, CLA_USU: await authService.hashPassword(req.body.CLA_USU) };
    const u = await Usuario.create(data);
    res.locals.createdId = u.ID_USU;
    return created(res, u, 'Usuario creado');
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const u = await Usuario.findByPk(req.params.id);
    if (!u) return notFound(res, 'Usuario no encontrado');
    const data = { ...req.body };
    if (data.CLA_USU) data.CLA_USU = await authService.hashPassword(data.CLA_USU);
    await u.update(data);
    return ok(res, u, 'Usuario actualizado');
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const u = await Usuario.findByPk(req.params.id);
    if (!u) return notFound(res, 'Usuario no encontrado');
    u.EST_USU = 'INACTIVO';
    await u.save();
    return ok(res, null, 'Usuario inactivado');
  } catch (err) { next(err); }
}

module.exports = { listar, crear, actualizar, eliminar };
