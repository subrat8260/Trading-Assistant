import User from '../models/user.model.js';

/**
 * Data Access Layer for User entity (Clean Architecture)
 */
class UserRepository {
  /**
   * Find user by email
   */
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email });
    if (includePassword) {
      query.select('+password +refreshTokens');
    }
    return await query.exec();
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    return await User.findById(id).exec();
  }

  /**
   * Find user by ID including refreshTokens secret field
   */
  async findByIdWithRefreshTokens(id) {
    return await User.findById(id).select('+refreshTokens').exec();
  }

  /**
   * Create new user
   */
  async create(userData) {
    return await User.create(userData);
  }

  /**
   * Add refresh token to user's tokens array
   */
  async addRefreshToken(userId, token) {
    return await User.findByIdAndUpdate(
      userId,
      { $push: { refreshTokens: { token } } },
      { new: true }
    ).exec();
  }

  /**
   * Remove specific refresh token
   */
  async removeRefreshToken(userId, token) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { refreshTokens: { token } } },
      { new: true }
    ).exec();
  }

  /**
   * Remove all refresh tokens (for full logout across all devices)
   */
  async removeAllRefreshTokens(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { refreshTokens: [] } },
      { new: true }
    ).exec();
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId, newPreferences) {
    return await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'preferences.theme': newPreferences.theme,
          'preferences.currency': newPreferences.currency,
          'preferences.riskTolerance': newPreferences.riskTolerance,
          'preferences.defaultLeverage': newPreferences.defaultLeverage,
        },
      },
      { new: true, runValidators: true }
    ).exec();
  }
}

export default new UserRepository();
