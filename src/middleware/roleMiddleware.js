const { sendError } = require('../utils/responseUtils');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        'You do not have permission to perform this action'
      );
    }

    next();
  };
};

module.exports = roleMiddleware;
