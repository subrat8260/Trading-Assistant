import signalAuthService from '../services/signalAuth.service.js';
import signalService from '../services/signal.service.js';
import catchAsync from '../utils/catchAsync.js';

export const login = catchAsync(async (req, res) => {
  const status = await signalAuthService.login(req.body);

  res.status(200).json({
    status: 'success',
    message: 'Signal24x7 session authenticated successfully',
    data: status,
  });
});

export const getStatus = catchAsync(async (req, res) => {
  const status = signalAuthService.getStatus();

  res.status(200).json({
    status: 'success',
    data: status,
  });
});

export const generateSignal = catchAsync(async (req, res) => {
  const signalData = await signalService.generateSignal(req.body);

  res.status(200).json({
    status: 'success',
    message: 'Signal generated successfully',
    data: signalData,
  });
});

export const logout = catchAsync(async (req, res) => {
  const result = await signalAuthService.logout();

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
