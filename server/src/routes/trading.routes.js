import { Router } from 'express';
import {
  startSession,
  recordResult,
  getCurrentSession,
  resetSession,
  getTradeHistory,
} from '../controllers/trading.controller.js';
import validate from '../middlewares/validate.middleware.js';
import {
  startSessionSchema,
  recordResultSchema,
} from '../utils/validators/trading.validator.js';
import protect from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all trading session endpoints
router.use(protect);

router.post('/start', validate(startSessionSchema), startSession);
router.post('/result', validate(recordResultSchema), recordResult);
router.get('/current', getCurrentSession);
router.post('/reset', resetSession);
router.get('/history', getTradeHistory);

export default router;
