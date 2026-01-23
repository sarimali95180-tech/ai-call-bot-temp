import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responseHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorResponse(res, 401, 'Authorization header missing. Please login first.');
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return errorResponse(res, 401, 'Token not found in authorization header.');
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token has expired. Please login again.');
    }

    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid token. Please login again.');
    }

    return errorResponse(res, 401, 'Authentication failed. Please login.');
  }
};

export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Optional auth - continue even if token is invalid
    next();
  }
};
