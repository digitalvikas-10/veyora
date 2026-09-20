import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, normalize it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ApiError(HTTP_STATUS.BAD_REQUEST, `Resource not found with id of ${err.value}`);
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new ApiError(HTTP_STATUS.CONFLICT, `Duplicate value entered for '${field}' field`);
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((val) => val.message);
    error = new ApiError(HTTP_STATUS.BAD_REQUEST, 'Validation error', errors);
  }

  // Handle JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication token expired');
  }

  const response = {
    success: false,
    message: error.message || 'An unexpected error occurred',
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
};

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, `API endpoint '${req.originalUrl}' not found on VEYORA server`));
};
