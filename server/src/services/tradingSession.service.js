import TradingSession from '../models/tradingSession.model.js';
import TradeLog from '../models/tradeLog.model.js';
import excelService from './excel.service.js';
import AppError from '../utils/AppError.js';

/**
 * Service Layer for Trading Execution Workflow & Continuous Masaniello Position Sizing
 */
class TradingSessionService {
  /**
   * Helper to pre-calculate both WIN and LOSS scenario next trade stakes
   */
  async computePrecalculatedStakes(sessionParams, currentSequence) {
    try {
      const [winRes, lossRes] = await Promise.all([
        excelService.calculateMasaniello({
          initialCapital: sessionParams.initialCapital,
          totalEvents: sessionParams.totalTrades,
          expectedWins: sessionParams.winsRequired,
          quota: sessionParams.payout,
          tradeResults: [...currentSequence, 'w'],
        }),
        excelService.calculateMasaniello({
          initialCapital: sessionParams.initialCapital,
          totalEvents: sessionParams.totalTrades,
          expectedWins: sessionParams.winsRequired,
          quota: sessionParams.payout,
          tradeResults: [...currentSequence, 'l'],
        }),
      ]);

      const winNextStake =
        winRes.trades?.[winRes.trades.length - 1]?.stakeAmount ?? null;
      const lossNextStake =
        lossRes.trades?.[lossRes.trades.length - 1]?.stakeAmount ?? null;

      return { winNextStake, lossNextStake };
    } catch (err) {
      console.error('Error pre-calculating WIN/LOSS next stakes:', err);
      return { winNextStake: null, lossNextStake: null };
    }
  }

  /**
   * Start a new trading session
   */
  async startSession(
    userId,
    { capital = 25670, trades = 6, winsRequired = 1, payout = 1.82 } = {}
  ) {
    // Deactivate any existing active session for user
    await TradingSession.updateMany(
      { userId, status: 'ACTIVE' },
      { $set: { status: 'COMPLETED' } }
    );

    // Calculate initial stake size via ExcelService
    const excelRes = await excelService.calculateMasaniello({
      initialCapital: capital,
      totalEvents: trades,
      expectedWins: winsRequired,
      quota: payout,
      tradeResults: [],
    });

    const initialStake = excelRes.trades?.[0]?.stakeAmount ?? null;

    const { winNextStake, lossNextStake } = await this.computePrecalculatedStakes(
      { initialCapital: capital, totalTrades: trades, winsRequired, payout },
      []
    );

    const newSession = await TradingSession.create({
      userId,
      initialCapital: capital,
      currentCapital: capital,
      totalTrades: trades,
      winsRequired,
      payout,
      sequence: [],
      currentTradeNumber: 1,
      nextTradeAmount: initialStake,
      winNextStake,
      lossNextStake,
      status: 'ACTIVE',
    });

    return {
      session: newSession,
      excelSummary: excelRes.summary,
    };
  }

  /**
   * Record trade result (WIN / LOSS), recalculate continuous sequence via ExcelService, and log trade.
   * Session remains ACTIVE continuously until manually reset by the user.
   */
  async recordResult(
    userId,
    { sessionId, result, pair, timeframe, signal, strength = '', analyzer = '' }
  ) {
    const formattedResultCode = result.toLowerCase(); // 'w' or 'l'
    const formattedResultTag = result.toUpperCase(); // 'W' or 'L'

    // Find session by ID or fallback to current ACTIVE session
    let session;
    if (sessionId) {
      session = await TradingSession.findOne({ _id: sessionId, userId });
    } else {
      session = await TradingSession.findOne({ userId, status: 'ACTIVE' });
    }

    if (!session) {
      throw new AppError(
        'No active trading session found. Please start a new session first.',
        400
      );
    }

    const balanceBefore = session.currentCapital;
    const executedTradeAmount = session.nextTradeAmount ?? 0;

    // Append result to sequence
    const updatedSequence = [...session.sequence, formattedResultCode];

    // Delegate calculation to ExcelService
    const excelRes = await excelService.calculateMasaniello({
      initialCapital: session.initialCapital,
      totalEvents: session.totalTrades,
      expectedWins: session.winsRequired,
      quota: session.payout,
      tradeResults: updatedSequence,
    });

    // Extract updated metrics from Excel output
    const lastTradeIndex = updatedSequence.length - 1;
    const lastExcelTrade = excelRes.trades?.[lastTradeIndex];
    const nextExcelTrade = excelRes.trades?.[lastTradeIndex + 1];

    let balanceAfter = lastExcelTrade?.portfolioBalance;

    // Strict safety check: Ensure LOSS trades strictly decrease capital and WIN trades strictly increase capital
    if (formattedResultTag === 'L') {
      if (balanceAfter === undefined || balanceAfter === null || balanceAfter >= balanceBefore) {
        balanceAfter = balanceBefore - executedTradeAmount;
      }
    } else if (formattedResultTag === 'W') {
      if (balanceAfter === undefined || balanceAfter === null || balanceAfter <= balanceBefore) {
        balanceAfter = balanceBefore + executedTradeAmount * (session.payout - 1);
      }
    }

    // Get next stake size from Excel
    const nextTradeAmount =
      nextExcelTrade?.stakeAmount ??
      excelRes.trades?.[excelRes.trades.length - 1]?.stakeAmount ??
      executedTradeAmount;

    // Pre-calculate WIN & LOSS stakes for the NEXT trade
    const { winNextStake, lossNextStake } = await this.computePrecalculatedStakes(
      {
        initialCapital: session.initialCapital,
        totalTrades: session.totalTrades,
        winsRequired: session.winsRequired,
        payout: session.payout,
      },
      updatedSequence
    );

    const sessionStatus = 'ACTIVE';

    // Create TradeLog entry in MongoDB
    const tradeLog = await TradeLog.create({
      sessionId: session._id,
      userId,
      pair,
      timeframe,
      signal: signal.toUpperCase(),
      strength,
      analyzer,
      amount: executedTradeAmount,
      result: formattedResultTag,
      balanceBefore,
      balanceAfter,
    });

    // Update TradingSession in MongoDB
    session.sequence = updatedSequence;
    session.currentCapital = balanceAfter;
    session.currentTradeNumber = updatedSequence.length + 1;
    session.nextTradeAmount = nextTradeAmount;
    session.winNextStake = winNextStake;
    session.lossNextStake = lossNextStake;
    session.status = sessionStatus;
    await session.save();

    const sessionProfit = balanceAfter - session.initialCapital;

    return {
      nextTradeAmount,
      winNextStake,
      lossNextStake,
      currentCapital: balanceAfter,
      tradeNumber: session.currentTradeNumber,
      sequence: updatedSequence.map((r) => r.toUpperCase()),
      profit: sessionProfit,
      sessionStatus,
      session,
      tradeLog,
    };
  }

  /**
   * Get current active session & trade logs
   */
  async getCurrentSession(userId) {
    const session = await TradingSession.findOne({ userId, status: 'ACTIVE' });
    if (!session) {
      return { session: null, recentTrades: [] };
    }

    const recentTrades = await TradeLog.find({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return { session, recentTrades };
  }

  /**
   * Reset / complete current trading session
   */
  async resetSession(userId, sessionId) {
    let session;
    if (sessionId) {
      session = await TradingSession.findOne({ _id: sessionId, userId });
    } else {
      session = await TradingSession.findOne({ userId, status: 'ACTIVE' });
    }

    if (session) {
      session.status = 'COMPLETED';
      await session.save();
    }

    return { message: 'Trading session reset successfully' };
  }

  /**
   * Get trade history
   */
  async getTradeHistory(userId, limit = 50) {
    return await TradeLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

export default new TradingSessionService();
