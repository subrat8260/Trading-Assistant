import tradingSessionService from '../services/tradingSession.service.js';
import catchAsync from '../utils/catchAsync.js';

export const startSession = catchAsync(async (req, res) => {
  const result = await tradingSessionService.startSession(req.user._id, req.body);

  res.status(201).json({
    status: 'success',
    message: 'Trading session started successfully',
    data: result,
  });
});

export const recordResult = catchAsync(async (req, res) => {
  const result = await tradingSessionService.recordResult(req.user._id, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Trade result recorded successfully',
    data: result,
  });
});

export const getCurrentSession = catchAsync(async (req, res) => {
  const result = await tradingSessionService.getCurrentSession(req.user._id);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const resetSession = catchAsync(async (req, res) => {
  const result = await tradingSessionService.resetSession(req.user._id, req.body?.sessionId);

  res.status(200).json({
    status: 'success',
    message: 'Trading session reset successfully',
    data: result,
  });
});

export const getTradeHistory = catchAsync(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
  const history = await tradingSessionService.getTradeHistory(req.user._id, limit);

  res.status(200).json({
    status: 'success',
    results: history.length,
    data: { trades: history },
  });
});
