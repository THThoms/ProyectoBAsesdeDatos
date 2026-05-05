const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { unauthorized } = require('../utils/response');

const blacklist = new Set();

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return unauthorized(res, 'Token no proporcionado');
  }
  const token = header.slice(7);
  if (blacklist.has(token)) return unauthorized(res, 'Token revocado');

  try {
    const payload = jwt.verify(token, jwtConfig.secret);
    req.user = payload;
    req.token = token;
    next();
  } catch (err) {
    return unauthorized(res, 'Token invalido o expirado');
  }
}

authMiddleware.revoke = (token) => blacklist.add(token);

module.exports = authMiddleware;
