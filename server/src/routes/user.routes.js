import { Router } from 'express';
import { updatePreferences } from '../controllers/user.controller.js';
import protect from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { updatePreferencesSchema } from '../utils/validators/auth.validator.js';

const router = Router();

// Protect all user routes
router.use(protect);

router.patch('/preferences', validate(updatePreferencesSchema), updatePreferences);

export default router;
