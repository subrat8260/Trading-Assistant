import mongoose from 'mongoose';

const tradeLogSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TradingSession',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pair: {
      type: String,
      required: [true, 'Trading pair is required'],
      trim: true,
    },
    timeframe: {
      type: String,
      required: [true, 'Timeframe is required'],
      trim: true,
    },
    signal: {
      type: String,
      required: [true, 'Signal direction (BUY/SELL) is required'],
      uppercase: true,
      trim: true,
    },
    strength: {
      type: String,
      default: '',
    },
    analyzer: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Trade stake amount is required'],
    },
    result: {
      type: String,
      enum: ['W', 'L'],
      required: [true, 'Trade result (W/L) is required'],
      uppercase: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TradeLog = mongoose.model('TradeLog', tradeLogSchema);

export default TradeLog;
