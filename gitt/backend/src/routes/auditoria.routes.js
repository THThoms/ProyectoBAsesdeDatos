const express = require('express');
const auth = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const ctrl = require('../controllers/auditoria.controller');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(auth, checkRole([ROLES.ADMINISTRADOR]));
router.get('/', ctrl.listar);

module.exports = router;
