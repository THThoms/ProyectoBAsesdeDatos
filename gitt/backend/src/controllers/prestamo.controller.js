const prestamoService = require('../services/prestamo.service');
const { ok, created, notFound } = require('../utils/response');
const { getPagination, buildMeta } = require('../utils/pagination');

async function listar(req, res, next) {
  try {
    const pag = getPagination(req.query);
    const data = await prestamoService.listar(pag, req.query);
    return ok(res, data.rows, 'Prestamos', buildMeta(pag, data.total));
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const p = await prestamoService.obtener(req.params.id);
    if (!p) return notFound(res, 'Prestamo no encontrado');
    return ok(res, p);
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const p = await prestamoService.crearPrestamo(req.body, req.user.id_usu);
    res.locals.createdId = p.ID_PRE;
    return created(res, p, 'Prestamo creado');
  } catch (err) { next(err); }
}

async function devolver(req, res, next) {
  try {
    const p = await prestamoService.registrarDevolucion(req.params.id, req.body.detalles || [], req.user.id_usu);
    return ok(res, p, 'Devolucion registrada');
  } catch (err) { next(err); }
}

async function cancelar(req, res, next) {
  try {
    const p = await prestamoService.cancelar(req.params.id, req.user.id_usu);
    return ok(res, p, 'Prestamo cancelado');
  } catch (err) { next(err); }
}

async function vencidos(req, res, next) {
  try {
    const data = await prestamoService.vencidos();
    return ok(res, data);
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, devolver, cancelar, vencidos };
