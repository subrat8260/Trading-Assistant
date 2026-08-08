import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import tradeRoutes from './trade.routes.js';
import excelRoutes from './excel.routes.js';
import signalRoutes from './signal.routes.js';
import tradingRoutes from './trading.routes.js';
import analyticsRoutes from './analytics.routes.js';
import protect from '../middlewares/auth.middleware.js';

const router = Router();

// Mount public / core routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Mount protected feature routes
router.use('/users', userRoutes);
router.use('/trades', protect, tradeRoutes);
router.use('/excel', excelRoutes);
router.use('/signal', signalRoutes);
router.use('/trading', tradingRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
