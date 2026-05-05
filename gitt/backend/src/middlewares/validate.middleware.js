const { fail } = require('../utils/response');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
    if (error) {
      return fail(res, 'Datos invalidos', error.details.map(d => d.message));
    }
    req[source] = value;
    next();
  };
}

module.exports = validate;
