const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const ctrl = require('../controllers/auth.controller');
const { loginSchema, changePasswordSchema } = require('../validators/auth.validator');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos. Espere 15 minutos.' }
});

router.post('/login',           loginLimiter, validate(loginSchema), ctrl.login);
router.post('/logout',          auth, ctrl.logout);
router.get ('/me',              auth, ctrl.me);
router.put ('/change-password', auth, validate(changePasswordSchema), ctrl.changePassword);

module.exports = router;
