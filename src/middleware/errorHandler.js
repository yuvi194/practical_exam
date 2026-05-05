const { sendError } = require('../utils/responseUtils');

const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, 'Validation failed', errors);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `${field} already exists`);
  }

  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token has expired');
  }

  if (err.isOperational) {
    return sendError(res, err.statusCode || 400, err.message);
  }

  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message;

  return sendError(res, 500, message);
};

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };
