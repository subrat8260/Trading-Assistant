import api from './api';

export const analyticsService = {
  /**
   * Fetch overview metrics (Win Rate, Streaks, Net Profit, ROI, Drawdown)
   */
  getOverview: (params = {}) => {
    return api.get('/analytics/overview', { params });
  },

  /**
   * Fetch breakdown statistics (Pair, Timeframe, Day, Month, Highlights)
   */
  getPerformance: (params = {}) => {
    return api.get('/analytics/performance', { params });
  },

  /**
   * Fetch Recharts datasets (Equity Curve, Daily/Monthly Profit, Win/Loss Pie, Pair/Timeframe)
   */
  getCharts: (params = {}) => {
    return api.get('/analytics/charts', { params });
  },

  /**
   * Fetch trade journal history table with pagination
   */
  getHistory: (params = {}) => {
    return api.get('/analytics/history', { params });
  },

  /**
   * Export trade journal as CSV, Excel, or PDF file download
   */
  exportFile: async (filters = {}, format = 'csv') => {
    const response = await api.get('/analytics/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });

    const blob = new Blob([response]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const extension = format === 'excel' ? 'xlsx' : format;
    link.setAttribute('download', `trading_journal_${Date.now()}.${extension}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default analyticsService;
