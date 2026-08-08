import authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';
import config from '../config/index.js';

/**
 * Cookie options helper for HTTP-only refresh token
 */
const getCookieOptions = (rememberMe = false) => {
  const maxAgeMs = rememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 7 * 24 * 60 * 60 * 1000; // 7 days

  return {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? 'strict' : 'lax',
    maxAge: maxAgeMs,
  };
};

export const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

  // Set HTTP-only cookie for Refresh Token
  res.cookie('refreshToken', refreshToken, getCookieOptions(false));

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user,
      accessToken,
    },
  });
});

export const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken, rememberMe } = await authService.loginUser(req.body);

  // Set HTTP-only cookie for Refresh Token
  res.cookie('refreshToken', refreshToken, getCookieOptions(rememberMe));

  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully',
    data: {
      user,
      accessToken,
    },
  });
});

export const refreshToken = catchAsync(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(incomingRefreshToken);

  // Update HTTP-only cookie with new refresh token
  res.cookie('refreshToken', newRefreshToken, getCookieOptions());

  res.status(200).json({
    status: 'success',
    data: {
      accessToken,
    },
  });
});

export const logout = catchAsync(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const userId = req.user?._id;

  await authService.logoutUser(userId, incomingRefreshToken);

  // Clear HTTP-only cookie
  res.clearCookie('refreshToken', getCookieOptions());

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export const getMe = catchAsync(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
