const express = require('express');

const router = express.Router();

router.use('/auth',           require('./auth.routes'));
router.use('/articulos',      require('./articulo.routes'));
router.use('/prestamos',      require('./prestamo.routes'));
router.use('/mantenimientos', require('./mantenimiento.routes'));
router.use('/movimientos',    require('./movimiento.routes'));
router.use('/notificaciones', require('./notificacion.routes'));
router.use('/reportes',       require('./reporte.routes'));
router.use('/auditoria',      require('./auditoria.routes'));
router.use('/usuarios',       require('./usuario.routes'));
router.use('/',               require('./catalogo.routes'));

module.exports = router;
