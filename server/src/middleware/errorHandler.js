const mongoose = require('mongoose');
const { logger } = require('../utils/observability');

// errorHandler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  const statusCode = error.statusCode || 500;
  if (process.env.NODE_ENV !== 'test') {
    logger.error('http.request_failed', {
      requestId: req.requestId,
      method: req.method,
      route: req.route?.path || 'unmatched',
      statusCode,
      errorName: err.name || 'Error',
      errorCode: err.code
    });
  }

  const safeMessage = statusCode >= 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected server error occurred'
    : error.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
