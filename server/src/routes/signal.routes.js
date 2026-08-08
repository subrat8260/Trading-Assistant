import { Router } from 'express';
import {
  login,
  getStatus,
  generateSignal,
  logout,
} from '../controllers/signal.controller.js';
import validate from '../middlewares/validate.middleware.js';
import {
  signalLoginSchema,
  generateSignalSchema,
} from '../utils/validators/signal.validator.js';
import protect from '../middlewares/auth.middleware.js';

const router = Router();

// Protect Signal endpoints
router.use(protect);

router.post('/login', validate(signalLoginSchema), login);
router.get('/status', getStatus);
router.post('/generate', validate(generateSignalSchema), generateSignal);
router.post('/logout', logout);

export default router;
