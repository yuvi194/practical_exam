const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/responseUtils');

const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      429,
      'Too many requests from this IP, please try again later'
    );
  },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      429,
      'Too many authentication attempts, please try again later'
    );
  },
});

module.exports = { rateLimiter, authRateLimiter };
