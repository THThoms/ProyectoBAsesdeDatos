const reporteService = require('../services/reporte.service');
const { ok } = require('../utils/response');

async function dashboard(req, res, next) {
  try { return ok(res, await reporteService.dashboard()); } catch (err) { next(err); }
}
async function inventario(req, res, next) {
  try { return ok(res, await reporteService.inventario()); } catch (err) { next(err); }
}
async function prestamosActivos(req, res, next) {
  try { return ok(res, await reporteService.prestamosActivos()); } catch (err) { next(err); }
}
async function mantenimientos(req, res, next) {
  try { return ok(res, await reporteService.mantenimientos()); } catch (err) { next(err); }
}

module.exports = { dashboard, inventario, prestamosActivos, mantenimientos };
