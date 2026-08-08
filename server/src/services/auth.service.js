import userRepository from '../repositories/user.repository.js';
import AppError from '../utils/AppError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/token.utils.js';

/**
 * Service Layer for Authentication & User Account Management (Clean Architecture)
 */
class AuthService {
  /**
   * Register a new user
   */
  async registerUser({ name, email, password }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const newUser = await userRepository.create({ name, email, password });
    
    // Generate Access & Refresh tokens
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id, false);

    // Save refresh token to user record
    await userRepository.addRefreshToken(newUser._id, refreshToken);

    return {
      user: newUser.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user with credentials and optional Remember Me flag
   */
  async loginUser({ email, password, rememberMe = false }) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id, rememberMe);

    // Store refresh token
    await userRepository.addRefreshToken(user._id, refreshToken);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
      rememberMe,
    };
  }

  /**
   * Refresh Access Token using valid Refresh Token
   */
  async refreshAccessToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (_err) {
      throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
    }

    const user = await userRepository.findByIdWithRefreshTokens(decoded.id);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Check if refresh token exists in user's saved tokens list
    const hasToken = user.refreshTokens.some((rt) => rt.token === incomingRefreshToken);
    if (!hasToken) {
      throw new AppError('Refresh token revoked or invalid', 401);
    }

    // Rotate refresh token: generate new access & new refresh token
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id, decoded.rememberMe);

    // Remove old refresh token and add new refresh token
    await userRepository.removeRefreshToken(user._id, incomingRefreshToken);
    await userRepository.addRefreshToken(user._id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user by revoking refresh token
   */
  async logoutUser(userId, refreshToken) {
    if (userId && refreshToken) {
      await userRepository.removeRefreshToken(userId, refreshToken);
    }
    return true;
  }

  /**
   * Get current authenticated user details
   */
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId, preferences) {
    const currentUser = await userRepository.findById(userId);
    if (!currentUser) {
      throw new AppError('User not found', 404);
    }

    const mergedPreferences = {
      ...currentUser.preferences.toObject(),
      ...preferences,
    };

    const updatedUser = await userRepository.updatePreferences(userId, mergedPreferences);
    return updatedUser;
  }
}

export default new AuthService();
