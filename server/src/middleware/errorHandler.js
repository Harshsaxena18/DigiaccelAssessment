import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`, [
      { field: err.path, message: `Invalid ${err.path} format.` },
    ]);
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.validationError('Validation failed.', details);
  }

  // Default to internal server error if not an ApiError instance
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const message = error.message || 'An unexpected server error occurred.';
  const details = error.details || [];

  if (statusCode >= 500 && env.NODE_ENV !== 'test') {
    console.error('[Unhandled Error]', err);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details.length > 0 ? { details } : {}),
      ...(env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
    },
  });
};
