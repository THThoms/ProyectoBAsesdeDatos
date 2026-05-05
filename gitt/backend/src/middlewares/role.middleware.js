const { forbidden } = require('../utils/response');

function checkRole(rolesPermitidos) {
  const lista = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
  return (req, res, next) => {
    if (!req.user) return forbidden(res, 'Usuario no autenticado');
    if (!lista.includes(req.user.id_rol)) {
      return forbidden(res, 'No tiene permisos para realizar esta accion');
    }
    next();
  };
}

module.exports = checkRole;
