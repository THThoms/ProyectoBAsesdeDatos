const express = require('express');
const auth = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/notificacion.controller');

const router = express.Router();

router.use(auth);

router.get   ('/',                ctrl.listar);
router.get   ('/pendientes',      ctrl.pendientes);
router.put   ('/:id/leer',        ctrl.marcarLeida);
router.delete('/:id',             ctrl.eliminar);

module.exports = router;
