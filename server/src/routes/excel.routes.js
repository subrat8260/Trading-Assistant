import { Router } from 'express';
import { calculateMasaniello } from '../controllers/excel.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { calculateMasanielloSchema } from '../utils/validators/excel.validator.js';
import protect from '../middlewares/auth.middleware.js';

const router = Router();

// Protect Excel engine endpoint
router.use(protect);

router.post('/calculate', validate(calculateMasanielloSchema), calculateMasaniello);

export default router;
