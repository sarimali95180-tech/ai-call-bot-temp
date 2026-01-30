// Standardized API Response Helper
export const successResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const errorResponse = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'UnauthorizedError') {
    return errorResponse(res, 401, 'Unauthorized access');
  }

  if (err.name === 'ValidationError') {
    return errorResponse(res, 400, 'Validation failed', err.details);
  }

  if (err.statusCode) {
    return errorResponse(res, err.statusCode, err.message);
  }

  return errorResponse(res, 500, 'Internal server error');
};
