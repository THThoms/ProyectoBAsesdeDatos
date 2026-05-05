const authService = require('../services/auth.service');
const auth = require('../middlewares/auth.middleware');
const { Usuario, Rol } = require('../models');
const { ok, fail } = require('../utils/response');

async function login(req, res, next) {
  try {
    const { correo, password } = req.body;
    const result = await authService.login(correo, password);
    return ok(res, result, 'Inicio de sesion exitoso');
  } catch (err) { next(err); }
}

async function logout(req, res) {
  if (req.token) auth.revoke(req.token);
  return ok(res, null, 'Sesion cerrada');
}

async function me(req, res, next) {
  try {
    const usuario = await Usuario.findByPk(req.user.id_usu, {
      include: [{ model: Rol, as: 'rol' }]
    });
    if (!usuario) return fail(res, 'Usuario no encontrado', null, 404);
    return ok(res, usuario);
  } catch (err) { next(err); }
}

async function changePassword(req, res, next) {
  try {
    const { actual, nueva } = req.body;
    if (!actual || !nueva || nueva.length < 8) {
      return fail(res, 'La nueva contrasena debe tener al menos 8 caracteres');
    }
    await authService.changePassword(req.user.id_usu, actual, nueva);
    return ok(res, null, 'Contrasena actualizada');
  } catch (err) { next(err); }
}

module.exports = { login, logout, me, changePassword };
