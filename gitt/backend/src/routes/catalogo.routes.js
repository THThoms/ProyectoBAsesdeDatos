const express = require('express');
const auth = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const audit = require('../middlewares/audit.middleware');
const c = require('../controllers/catalogo.controller');
const { ROLES } = require('../utils/constants');

const router = express.Router();
const ADMIN = checkRole([ROLES.ADMINISTRADOR]);

router.use(auth);

const mount = (base, h) => {
  router.get   (base,         h.list);
  router.post  (base,         ADMIN, audit, h.create);
  router.put   (`${base}/:id`, ADMIN, audit, h.update);
  router.delete(`${base}/:id`, ADMIN, audit, h.remove);
};

mount('/roles',         c.roles);
mount('/categorias',    c.categorias);
mount('/estados',       c.estados);
mount('/departamentos', c.departamentos);
mount('/ubicaciones',   c.ubicaciones);
mount('/responsables',  c.responsables);

module.exports = router;
