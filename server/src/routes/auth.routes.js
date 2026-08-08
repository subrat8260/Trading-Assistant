import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
} from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.middleware.js';
import protect from '../middlewares/auth.middleware.js';
import {
  registerSchema,
  loginSchema,
} from '../utils/validators/auth.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
