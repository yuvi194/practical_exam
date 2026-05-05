const { sendError } = require('../utils/responseUtils');

const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, 'Validation failed', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `${field} already exists`);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token has expired');
  }

  // Custom application errors
  if (err.isOperational) {
    return sendError(res, err.statusCode || 400, err.message);
  }

  // Unknown errors - don't leak details in production
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
