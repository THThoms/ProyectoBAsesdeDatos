const express = require('express');
const auth = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const audit = require('../middlewares/audit.middleware');
const ctrl = require('../controllers/usuario.controller');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(auth);

router.get   ('/',     ctrl.listar);
router.post  ('/',     checkRole([ROLES.ADMINISTRADOR]), audit, ctrl.crear);
router.put   ('/:id',  checkRole([ROLES.ADMINISTRADOR]), audit, ctrl.actualizar);
router.delete('/:id',  checkRole([ROLES.ADMINISTRADOR]), audit, ctrl.eliminar);

module.exports = router;
