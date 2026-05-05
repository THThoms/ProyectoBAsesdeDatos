const Joi = require('joi');

const loginSchema = Joi.object({
  correo:   Joi.string().email().required().messages({ 'string.email': 'Correo invalido' }),
  password: Joi.string().min(6).required()
});

const changePasswordSchema = Joi.object({
  actual: Joi.string().required(),
  nueva:  Joi.string().min(8).required()
});

module.exports = { loginSchema, changePasswordSchema };
