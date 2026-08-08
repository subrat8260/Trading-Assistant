import tradeService from '../services/trade.service.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Trade Controller - HTTP Request/Response Handler (Clean Architecture)
 */
export const getAllTrades = catchAsync(async (req, res) => {
  const result = await tradeService.getAllTrades(req.query);

  res.status(200).json({
    status: 'success',
    results: result.trades.length,
    total: result.total,
    data: { trades: result.trades },
  });
});

export const getTradeById = catchAsync(async (req, res) => {
  const trade = await tradeService.getTradeById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { trade },
  });
});

export const createTrade = catchAsync(async (req, res) => {
  const newTrade = await tradeService.createTrade(req.body);

  res.status(201).json({
    status: 'success',
    data: { trade: newTrade },
  });
});

export const updateTrade = catchAsync(async (req, res) => {
  const updatedTrade = await tradeService.updateTrade(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { trade: updatedTrade },
  });
});

export const deleteTrade = catchAsync(async (req, res) => {
  await tradeService.deleteTrade(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
