import { useState, useEffect, useCallback } from 'react';
import AuthContext from './AuthContext.js';
import authService from '../services/authService.js';
import { setAccessToken } from '../services/api.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleUnauthorized = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setAccessToken(null);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Attempt token refresh from HTTP-only cookie
        const refreshRes = await authService.refreshToken();
        if (refreshRes?.data?.accessToken) {
          setAccessToken(refreshRes.data.accessToken);
          // Fetch current user details
          const userRes = await authService.getCurrentUser();
          if (userRes?.data?.user) {
            setUser(userRes.data.user);
            setIsAuthenticated(true);
          }
        }
      } catch (_err) {
        // No active session or cookie expired
        setUser(null);
        setIsAuthenticated(false);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [handleUnauthorized]);

  const login = async ({ email, password, rememberMe }) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password, rememberMe });
      const { user: userData, accessToken } = response.data;
      
      setAccessToken(accessToken);
      setUser(userData);
      setIsAuthenticated(true);

      // Sync theme preference if present
      if (userData?.preferences?.theme) {
        const root = document.documentElement;
        if (userData.preferences.theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        localStorage.setItem('theme', userData.preferences.theme);
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ name, email, password }) => {
    setIsLoading(true);
    try {
      const response = await authService.register({ name, email, password });
      const { user: userData, accessToken } = response.data;

      setAccessToken(accessToken);
      setUser(userData);
      setIsAuthenticated(true);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences) => {
    const response = await authService.updatePreferences(newPreferences);
    if (response?.data?.user) {
      setUser(response.data.user);
      if (newPreferences.theme) {
        const root = document.documentElement;
        if (newPreferences.theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        localStorage.setItem('theme', newPreferences.theme);
      }
    }
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
