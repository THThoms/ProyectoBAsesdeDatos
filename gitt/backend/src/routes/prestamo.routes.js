const express = require('express');
const auth = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const audit = require('../middlewares/audit.middleware');
const ctrl = require('../controllers/prestamo.controller');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(auth);

router.get ('/vencidos',      ctrl.vencidos);
router.get ('/',              ctrl.listar);
router.get ('/:id',           ctrl.obtener);
router.post('/',              checkRole([ROLES.ADMINISTRADOR, ROLES.DOCENTE]), audit, ctrl.crear);
router.put ('/:id/devolver',  checkRole([ROLES.ADMINISTRADOR, ROLES.DOCENTE]), audit, ctrl.devolver);
router.put ('/:id/cancelar',  checkRole([ROLES.ADMINISTRADOR]), audit, ctrl.cancelar);

module.exports = router;
