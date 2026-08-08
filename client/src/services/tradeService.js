import api from './api';

export const tradeService = {
  /**
   * Fetch trades list with optional parameters
   */
  getTrades: (params = {}) => {
    return api.get('/trades', { params });
  },

  /**
   * Fetch trade by ID
   */
  getTradeById: (id) => {
    return api.get(`/trades/${id}`);
  },

  /**
   * Create trade stub
   */
  createTrade: (tradeData) => {
    return api.post('/trades', tradeData);
  },

  /**
   * Update trade stub
   */
  updateTrade: (id, updateData) => {
    return api.patch(`/trades/${id}`, updateData);
  },

  /**
   * Delete trade stub
   */
  deleteTrade: (id) => {
    return api.delete(`/trades/${id}`);
  },
};

export default tradeService;
