import AppError from '../utils/AppError.js';

/**
 * Generic request validator middleware using Zod schemas
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 */
export const validate = (schema) => {
  return async (req, _res, next) => {
    try {
      if (!schema) return next();
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessage = error.errors.map((err) => err.message).join('. ');
        return next(new AppError(errorMessage, 400));
      }
      next(new AppError(error.message || 'Validation Error', 400));
    }
  };
};

export default validate;
