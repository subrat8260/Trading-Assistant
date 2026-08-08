import Trade from '../models/trade.model.js';

/**
 * Repository layer for Trade entity (Clean Architecture - Data Access Layer)
 */
class TradeRepository {
  /**
   * Find all trades with optional filtering
   */
  async findAll(filter = {}, options = {}) {
    return await Trade.find(filter)
      .sort(options.sort || { createdAt: -1 })
      .limit(options.limit || 50)
      .skip(options.skip || 0);
  }

  /**
   * Find trade by ID
   */
  async findById(id) {
    return await Trade.findById(id);
  }

  /**
   * Create a new trade
   */
  async create(tradeData) {
    return await Trade.create(tradeData);
  }

  /**
   * Update trade by ID
   */
  async updateById(id, updateData) {
    return await Trade.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete trade by ID
   */
  async deleteById(id) {
    return await Trade.findByIdAndDelete(id);
  }

  /**
   * Count trades matching filter
   */
  async count(filter = {}) {
    return await Trade.countDocuments(filter);
  }
}

export default new TradeRepository();
