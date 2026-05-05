const express = require('express');
const auth = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const ctrl = require('../controllers/reporte.controller');
const { ROLES } = require('../utils/constants');

const router = express.Router();
router.use(auth);

router.get('/dashboard',         ctrl.dashboard);
router.get('/inventario',        checkRole([ROLES.ADMINISTRADOR]), ctrl.inventario);
router.get('/prestamos-activos', checkRole([ROLES.ADMINISTRADOR]), ctrl.prestamosActivos);
router.get('/mantenimientos',    checkRole([ROLES.ADMINISTRADOR]), ctrl.mantenimientos);

module.exports = router;
