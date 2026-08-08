import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/token.utils.js';
import userRepository from '../repositories/user.repository.js';

/**
 * Middleware to protect routes and verify JWT authentication
 */
export const protect = catchAsync(async (req, _res, next) => {
  let token;

  // 1. Check for token in Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    // 2. Check for token in cookies
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401)
    );
  }

  // 3. Verify token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (_err) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  // 4. Check if user still exists
  const currentUser = await userRepository.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 5. Grant access to protected route
  req.user = currentUser;
  next();
});

export default protect;
