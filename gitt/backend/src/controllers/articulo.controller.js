const articuloService = require('../services/articulo.service');
const { ok, created, notFound } = require('../utils/response');
const { getPagination, buildMeta } = require('../utils/pagination');

async function listar(req, res, next) {
  try {
    const pag = getPagination(req.query);
    const data = await articuloService.listar(pag, req.query);
    return ok(res, data.rows, 'Articulos', buildMeta(pag, data.total));
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const articulo = await articuloService.obtener(req.params.id);
    if (!articulo) return notFound(res, 'Articulo no encontrado');
    return ok(res, articulo);
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const articulo = await articuloService.crear(req.body, req.user.id_usu);
    res.locals.createdId = articulo.ID_ART;
    return created(res, articulo, 'Articulo creado');
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const articulo = await articuloService.actualizar(req.params.id, req.body, req.user.id_usu);
    return ok(res, articulo, 'Articulo actualizado');
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const articulo = await articuloService.eliminarLogico(req.params.id);
    return ok(res, articulo, 'Articulo dado de baja');
  } catch (err) { next(err); }
}

async function historial(req, res, next) {
  try {
    const data = await articuloService.historial(req.params.id);
    return ok(res, data);
  } catch (err) { next(err); }
}

async function mantenimientos(req, res, next) {
  try {
    const data = await articuloService.mantenimientos(req.params.id);
    return ok(res, data);
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, historial, mantenimientos };
