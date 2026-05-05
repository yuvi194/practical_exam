const { sendError } = require('../utils/responseUtils');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => d.message);
      return sendError(res, 422, 'Validation error', errors);
    }

    req[source] = value;
    next();
  };
};

module.exports = validate;
