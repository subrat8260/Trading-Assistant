import api from './api';

export const tradingService = {
  /**
   * Start a new trading session
   */
  startSession: (data) => {
    return api.post('/trading/start', data);
  },

  /**
   * Record trade result (WIN / LOSS) and recalculate next stake via ExcelService
   */
  recordResult: (data) => {
    return api.post('/trading/result', data);
  },

  /**
   * Get active trading session and recent trade logs
   */
  getCurrentSession: () => {
    return api.get('/trading/current');
  },

  /**
   * Reset / complete current trading session
   */
  resetSession: (data = {}) => {
    return api.post('/trading/reset', data);
  },

  /**
   * Get trade history log
   */
  getTradeHistory: (params = {}) => {
    return api.get('/trading/history', { params });
  },

  /**
   * Generate signal from Signal24x7
   */
  generateSignal: (data) => {
    return api.post('/signal/generate', data);
  },
};

export default tradingService;
