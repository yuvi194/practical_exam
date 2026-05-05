const { verifyAccessToken } = require('../utils/tokenUtils');
const { sendError } = require('../utils/responseUtils');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access token is missing or malformed');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Access token has expired');
    }
    return sendError(res, 401, 'Invalid access token');
  }
};

module.exports = authMiddleware;
