import analyticsService from '../services/analytics.service.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async (req, res) => {
  const overview = await analyticsService.getOverview(req.user._id, req.query);

  res.status(200).json({
    status: 'success',
    data: { overview },
  });
});

export const getPerformance = catchAsync(async (req, res) => {
  const performance = await analyticsService.getPerformance(req.user._id, req.query);

  res.status(200).json({
    status: 'success',
    data: { performance },
  });
});

export const getCharts = catchAsync(async (req, res) => {
  const charts = await analyticsService.getCharts(req.user._id, req.query);

  res.status(200).json({
    status: 'success',
    data: { charts },
  });
});

export const getHistory = catchAsync(async (req, res) => {
  const result = await analyticsService.getHistory(req.user._id, req.query, {
    page: req.query.page,
    limit: req.query.limit,
  });

  res.status(200).json({
    status: 'success',
    results: result.trades.length,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    data: { trades: result.trades },
  });
});

export const exportData = catchAsync(async (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();
  const file = await analyticsService.exportData(req.user._id, req.query, format);

  res.setHeader('Content-Type', file.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  res.send(file.buffer);
});
