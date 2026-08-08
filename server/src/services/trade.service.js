import tradeRepository from '../repositories/trade.repository.js';
import AppError from '../utils/AppError.js';

/**
 * Service layer for Trade operations (Clean Architecture - Business Logic Layer)
 */
class TradeService {
  /**
   * Get list of trades
   */
  async getAllTrades(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.symbol) filter.symbol = query.symbol.toUpperCase();

    const trades = await tradeRepository.findAll(filter);
    const total = await tradeRepository.count(filter);

    return { trades, total };
  }

  /**
   * Get single trade by ID
   */
  async getTradeById(id) {
    const trade = await tradeRepository.findById(id);
    if (!trade) {
      throw new AppError(`Trade not found with id: ${id}`, 404);
    }
    return trade;
  }

  /**
   * Create new trade stub
   */
  async createTrade(tradeData) {
    // Architecture stub: Business validation can be performed here
    return await tradeRepository.create(tradeData);
  }

  /**
   * Update existing trade stub
   */
  async updateTrade(id, updateData) {
    const existingTrade = await tradeRepository.findById(id);
    if (!existingTrade) {
      throw new AppError(`Trade not found with id: ${id}`, 404);
    }

    return await tradeRepository.updateById(id, updateData);
  }

  /**
   * Delete trade stub
   */
  async deleteTrade(id) {
    const trade = await tradeRepository.findById(id);
    if (!trade) {
      throw new AppError(`Trade not found with id: ${id}`, 404);
    }

    await tradeRepository.deleteById(id);
    return true;
  }
}

export default new TradeService();
