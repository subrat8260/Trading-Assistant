import AppError from '../utils/AppError.js';

/**
 * 404 Not Found Middleware for unhandled routes
 */
export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
};

export default notFoundHandler;
