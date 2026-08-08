import excelService from '../services/excel.service.js';
import catchAsync from '../utils/catchAsync.js';

export const calculateMasaniello = catchAsync(async (req, res) => {
  const result = await excelService.calculateMasaniello(req.body);

  res.status(200).json({
    status: 'success',
    message: 'Masaniello position sizing calculated successfully from Excel workbook',
    data: result,
  });
});
