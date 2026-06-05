const express = require('express');
const auth = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const audit = require('../middlewares/audit.middleware');
const ctrl = require('../controllers/movimiento.controller');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(auth);

router.get ('/',              ctrl.listar);
router.get ('/articulo/:id',  ctrl.porArticulo);
router.post('/',              checkRole([ROLES.ADMINISTRADOR]), audit, ctrl.crear);

module.exports = router;
