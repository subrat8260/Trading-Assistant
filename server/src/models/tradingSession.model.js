import mongoose from 'mongoose';

const tradingSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    initialCapital: {
      type: Number,
      required: [true, 'Initial capital is required'],
      min: [1, 'Initial capital must be positive'],
    },
    currentCapital: {
      type: Number,
      required: [true, 'Current capital is required'],
    },
    totalTrades: {
      type: Number,
      required: [true, 'Total trades count (N) is required'],
      min: 1,
      max: 100,
    },
    winsRequired: {
      type: Number,
      required: [true, 'Target wins count (K) is required'],
      min: 1,
    },
    payout: {
      type: Number,
      required: [true, 'Payout quota (Q) is required'],
      min: 1,
    },
    sequence: [
      {
        type: String,
        enum: ['w', 'l'],
      },
    ],
    currentTradeNumber: {
      type: Number,
      default: 1,
    },
    nextTradeAmount: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'FAILED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const TradingSession = mongoose.model('TradingSession', tradingSessionSchema);

export default TradingSession;
