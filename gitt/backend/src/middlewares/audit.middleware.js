const { Auditoria } = require('../models');
const logger = require('../utils/logger');

const tablaPorRuta = {
  articulos:       'ARTICULO',
  prestamos:       'PRESTAMO',
  mantenimientos:  'MANTENIMIENTO',
  movimientos:     'MOVIMIENTO',
  usuarios:        'USUARIO',
  responsables:    'RESPONSABLE',
  ubicaciones:     'UBICACION',
  categorias:      'CATEGORIA',
  notificaciones:  'NOTIFICACION'
};

const accionPorMetodo = {
  POST:   'INSERT',
  PUT:    'UPDATE',
  PATCH:  'UPDATE',
  DELETE: 'DELETE'
};

function auditMiddleware(req, res, next) {
  const accion = accionPorMetodo[req.method];
  if (!accion || !req.user) return next();

  res.on('finish', () => {
    if (res.statusCode >= 400) return;

    const segmentos = req.path.split('/').filter(Boolean);
    const recurso = segmentos[0];
    const tabla = tablaPorRuta[recurso];
    if (!tabla) return;

    const idReg = parseInt(segmentos[1] || res.locals?.createdId || '0', 10) || 0;

    Auditoria.create({
      ACC_AUD:    accion,
      TAB_AUD:    tabla,
      ID_REG_AUD: idReg,
      DES_AUD:    `${req.method} ${req.originalUrl}`.slice(0, 200),
      IP_EQU:     (req.ip || req.connection?.remoteAddress || '').slice(0, 45),
      ID_USU:     req.user.id_usu
    }).catch(err => logger.error('Error registrando auditoria:', err.message));
  });

  next();
}

module.exports = auditMiddleware;
