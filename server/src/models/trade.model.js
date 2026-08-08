import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Trading symbol is required'],
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: [true, 'Trade type (BUY/SELL) is required'],
    },
    entryPrice: {
      type: Number,
      required: [true, 'Entry price is required'],
      min: [0, 'Price must be positive'],
    },
    exitPrice: {
      type: Number,
      default: null,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity must be positive'],
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'CANCELLED'],
      default: 'OPEN',
    },
    pnl: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Trade = mongoose.model('Trade', tradeSchema);

export default Trade;
