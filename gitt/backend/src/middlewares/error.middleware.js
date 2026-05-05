const logger = require('../utils/logger');
const { fail, serverError } = require('../utils/response');

function errorMiddleware(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} - ${err.stack || err.message}`);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return fail(res, 'Error de validacion', err.errors?.map(e => e.message), 400);
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return fail(res, 'Violacion de integridad referencial', null, 409);
  }
  if (err.original?.errorNum === 20001) {
    return fail(res, 'El articulo ya tiene un prestamo activo', null, 409);
  }
  if (err.statusCode) {
    return fail(res, err.message, err.errors || null, err.statusCode);
  }
  return serverError(res, 'Error interno del servidor', process.env.NODE_ENV === 'development' ? err : null);
}

module.exports = errorMiddleware;
