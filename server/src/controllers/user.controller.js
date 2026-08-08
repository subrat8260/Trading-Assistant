import authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';

export const updatePreferences = catchAsync(async (req, res) => {
  const updatedUser = await authService.updateUserPreferences(req.user._id, req.body);

  res.status(200).json({
    status: 'success',
    message: 'User preferences updated successfully',
    data: {
      user: updatedUser,
    },
  });
});
