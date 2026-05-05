const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { Usuario, Rol } = require('../models');

const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

async function login(correo, password) {
  const usuario = await Usuario.scope('withPassword').findOne({
    where: { COR_USU: correo },
    include: [{ model: Rol, as: 'rol' }]
  });
  if (!usuario) throw Object.assign(new Error('Credenciales invalidas'), { statusCode: 401 });
  if (usuario.EST_USU !== 'ACTIVO') {
    throw Object.assign(new Error('Usuario inactivo o bloqueado'), { statusCode: 403 });
  }

  const ok = await bcrypt.compare(password, usuario.CLA_USU);
  if (!ok) throw Object.assign(new Error('Credenciales invalidas'), { statusCode: 401 });

  const payload = {
    id_usu:  usuario.ID_USU,
    correo:  usuario.COR_USU,
    nombre:  `${usuario.NOM_USU} ${usuario.APE_USU}`,
    id_rol:  usuario.ID_ROL,
    rol:     usuario.rol?.NOM_ROL
  };
  const token = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer:    jwtConfig.issuer,
    algorithm: jwtConfig.algorithm
  });

  return { token, usuario: payload };
}

async function changePassword(idUsu, actual, nueva) {
  const usuario = await Usuario.scope('withPassword').findByPk(idUsu);
  if (!usuario) throw Object.assign(new Error('Usuario no encontrado'), { statusCode: 404 });
  const ok = await bcrypt.compare(actual, usuario.CLA_USU);
  if (!ok) throw Object.assign(new Error('La contrasena actual no es correcta'), { statusCode: 400 });
  usuario.CLA_USU = await bcrypt.hash(nueva, ROUNDS);
  await usuario.save();
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

module.exports = { login, changePassword, hashPassword };
