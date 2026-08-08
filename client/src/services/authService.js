import api from './api';

export const authService = {
  /**
   * Register a new user
   */
  register: (data) => {
    return api.post('/auth/register', data);
  },

  /**
   * Login user with credentials
   */
  login: (data) => {
    return api.post('/auth/login', data);
  },

  /**
   * Refresh Access Token
   */
  refreshToken: () => {
    return api.post('/auth/refresh-token');
  },

  /**
   * Logout user
   */
  logout: () => {
    return api.post('/auth/logout');
  },

  /**
   * Get authenticated user profile
   */
  getCurrentUser: () => {
    return api.get('/auth/me');
  },

  /**
   * Update user preferences in MongoDB
   */
  updatePreferences: (preferences) => {
    return api.patch('/users/preferences', preferences);
  },
};

export default authService;
