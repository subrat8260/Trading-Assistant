import catchAsync from '../utils/catchAsync.js';
import mongoose from 'mongoose';

/**
 * Health check controller for monitoring application status
 */
export const getHealth = catchAsync(async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'success',
    message: 'Trading Assistant API is healthy and operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbStatusMap[dbState] || 'unknown',
      uptimeSeconds: Math.floor(process.uptime()),
    },
  });
});
