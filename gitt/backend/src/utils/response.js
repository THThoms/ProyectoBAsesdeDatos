function ok(res, data = null, message = 'OK', pagination = null, status = 200) {
  return res.status(status).json({ success: true, message, data, errors: null, pagination });
}

function created(res, data = null, message = 'Recurso creado') {
  return ok(res, data, message, null, 201);
}

function fail(res, message = 'Error', errors = null, status = 400, data = null) {
  return res.status(status).json({ success: false, message, data, errors, pagination: null });
}

function unauthorized(res, message = 'No autorizado') { return fail(res, message, null, 401); }
function forbidden(res, message = 'Acceso denegado') { return fail(res, message, null, 403); }
function notFound(res, message = 'Recurso no encontrado') { return fail(res, message, null, 404); }
function serverError(res, message = 'Error interno del servidor', err = null) {
  return fail(res, message, err ? [err.message || String(err)] : null, 500);
}

module.exports = { ok, created, fail, unauthorized, forbidden, notFound, serverError };
