import { Router } from 'express';
import {
  getOverview,
  getPerformance,
  getCharts,
  getHistory,
  exportData,
} from '../controllers/analytics.controller.js';
import protect from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all analytics endpoints
router.use(protect);

router.get('/overview', getOverview);
router.get('/performance', getPerformance);
router.get('/charts', getCharts);
router.get('/history', getHistory);
router.get('/export', exportData);

export default router;
