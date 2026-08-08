import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Generate short-lived Access Token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

/**
 * Generate Refresh Token (supports Remember Me option)
 */
export const generateRefreshToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe
    ? config.jwt.refreshRememberExpiresIn
    : config.jwt.refreshExpiresIn;

  return jwt.sign({ id: userId, rememberMe }, config.jwt.refreshSecret, {
    expiresIn,
  });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret);
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};
