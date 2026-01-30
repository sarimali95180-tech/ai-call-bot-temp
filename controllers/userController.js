import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Helper function to create JWT token
const createAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

/**
 * Login user with email and password
 * @public - No authentication required
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    const errors = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please provide a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      return errorResponse(res, 400, 'Validation failed', errors);
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      return errorResponse(res, 403, 'Your account is inactive. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate token
    const accessToken = createAccessToken(user);

    const userData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status,
    };

    return successResponse(res, 200, 'Login successful', { 
      accessToken, 
      user: userData 
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'An error occurred during login. Please try again.');
  }
};

/**
 * Get current user profile
 * @private - Authentication required
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const userData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      avatar_url: user.avatar_url,
      status: user.status,
      created_at: user.created_at,
      last_login: user.last_login,
    };

    return successResponse(res, 200, 'User profile retrieved successfully', userData);
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse(res, 500, 'Failed to retrieve user profile');
  }
};

/**
 * Update user profile
 * @private - Authentication required
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone_number, avatar_url } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Update fields if provided
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (phone_number) user.phone_number = phone_number;
    if (avatar_url) user.avatar_url = avatar_url;

    await user.save();

    const userData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      avatar_url: user.avatar_url,
      status: user.status,
    };

    return successResponse(res, 200, 'Profile updated successfully', userData);
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 500, 'Failed to update profile');
  }
};
