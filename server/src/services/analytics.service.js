import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import TradeLog from '../models/tradeLog.model.js';
import AppError from '../utils/AppError.js';

/**
 * Service Layer for Trading Journal & Advanced Analytics (Clean Architecture)
 */
class AnalyticsService {
  /**
   * Helper to build Mongoose match query from filter parameters
   */
  buildMatchFilter(userId, filters = {}) {
    const match = { userId: new mongoose.Types.ObjectId(userId) };

    if (filters.sessionId) {
      match.sessionId = new mongoose.Types.ObjectId(filters.sessionId);
    }
    if (filters.pair) {
      match.pair = filters.pair;
    }
    if (filters.timeframe) {
      match.timeframe = filters.timeframe;
    }
    if (filters.result) {
      match.result = filters.result.toUpperCase();
    }
    if (filters.startDate || filters.endDate) {
      match.createdAt = {};
      if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
    }

    return match;
  }

  /**
   * Overview Metrics: Streaks, ROI, Drawdown, Stakes, P&L
   */
  async getOverview(userId, filters = {}) {
    const match = this.buildMatchFilter(userId, filters);
    const trades = await TradeLog.find(match).sort({ createdAt: 1 });

    const totalTrades = trades.length;
    if (totalTrades === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        lossRate: 0,
        currentWinStreak: 0,
        currentLossStreak: 0,
        bestWinStreak: 0,
        worstLossStreak: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        roi: 0,
        averageStake: 0,
        largestStake: 0,
        largestDrawdown: 0,
      };
    }

    let winningTrades = 0;
    let losingTrades = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let bestWinStreak = 0;
    let worstLossStreak = 0;
    let currentStreakType = null;
    let currentStreakCount = 0;

    let totalStakeSum = 0;
    let largestStake = 0;

    // Peak to Trough Drawdown calculation
    let peakBalance = trades[0]?.balanceBefore || 0;
    let maxDrawdown = 0;

    trades.forEach((trade) => {
      const pnl = trade.balanceAfter - trade.balanceBefore;
      const stake = trade.amount || 0;

      totalStakeSum += stake;
      if (stake > largestStake) largestStake = stake;

      // Track Peak Balance and Drawdown
      if (trade.balanceAfter > peakBalance) {
        peakBalance = trade.balanceAfter;
      } else if (peakBalance > 0) {
        const drawdown = ((peakBalance - trade.balanceAfter) / peakBalance) * 100;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      }

      if (trade.result === 'W') {
        winningTrades += 1;
        totalProfit += pnl > 0 ? pnl : 0;

        if (currentStreakType === 'W') {
          currentStreakCount += 1;
        } else {
          currentStreakType = 'W';
          currentStreakCount = 1;
        }
        if (currentStreakCount > bestWinStreak) bestWinStreak = currentStreakCount;
      } else {
        losingTrades += 1;
        totalLoss += Math.abs(pnl);

        if (currentStreakType === 'L') {
          currentStreakCount += 1;
        } else {
          currentStreakType = 'L';
          currentStreakCount = 1;
        }
        if (currentStreakCount > worstLossStreak) worstLossStreak = currentStreakCount;
      }
    });

    if (currentStreakType === 'W') {
      currentWinStreak = currentStreakCount;
      currentLossStreak = 0;
    } else if (currentStreakType === 'L') {
      currentLossStreak = currentStreakCount;
      currentWinStreak = 0;
    }

    const netProfit = totalProfit - totalLoss;
    const initialCap = trades[0]?.balanceBefore || 1;
    const roi = (netProfit / initialCap) * 100;
    const winRate = (winningTrades / totalTrades) * 100;
    const lossRate = (losingTrades / totalTrades) * 100;
    const averageStake = totalStakeSum / totalTrades;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate: parseFloat(winRate.toFixed(2)),
      lossRate: parseFloat(lossRate.toFixed(2)),
      currentWinStreak,
      currentLossStreak,
      bestWinStreak,
      worstLossStreak,
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalLoss: parseFloat(totalLoss.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      roi: parseFloat(roi.toFixed(2)),
      averageStake: parseFloat(averageStake.toFixed(2)),
      largestStake: parseFloat(largestStake.toFixed(2)),
      largestDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    };
  }

  /**
   * Performance Analysis: Best/Worst Pairs, Timeframes, Day, Week, Month
   */
  async getPerformance(userId, filters = {}) {
    const match = this.buildMatchFilter(userId, filters);
    const trades = await TradeLog.find(match);

    const pairStats = {};
    const timeframeStats = {};
    const dayStats = {};
    const monthStats = {};

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    trades.forEach((trade) => {
      const pnl = trade.balanceAfter - trade.balanceBefore;
      const isWin = trade.result === 'W';
      const date = new Date(trade.createdAt);

      const dayName = daysOfWeek[date.getDay()];
      const monthName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Helper to update grouping stat
      const updateGroup = (map, key) => {
        if (!map[key]) {
          map[key] = { name: key, total: 0, wins: 0, losses: 0, netProfit: 0 };
        }
        map[key].total += 1;
        if (isWin) map[key].wins += 1;
        else map[key].losses += 1;
        map[key].netProfit += pnl;
      };

      updateGroup(pairStats, trade.pair || 'Unknown');
      updateGroup(timeframeStats, trade.timeframe || '1m');
      updateGroup(dayStats, dayName);
      updateGroup(monthStats, monthName);
    });

    const formatStatsList = (map) =>
      Object.values(map).map((item) => ({
        ...item,
        winRate: item.total ? parseFloat(((item.wins / item.total) * 100).toFixed(2)) : 0,
        netProfit: parseFloat(item.netProfit.toFixed(2)),
      }));

    const pairs = formatStatsList(pairStats);
    const timeframes = formatStatsList(timeframeStats);
    const days = formatStatsList(dayStats);
    const months = formatStatsList(monthStats);

    // Identify Best & Worst Pair
    const sortedPairs = [...pairs].sort((a, b) => b.netProfit - a.netProfit);
    const bestPair = sortedPairs[0] || null;
    const worstPair = sortedPairs[sortedPairs.length - 1] || null;

    // Identify Best & Worst Timeframe
    const sortedTimeframes = [...timeframes].sort((a, b) => b.netProfit - a.netProfit);
    const bestTimeframe = sortedTimeframes[0] || null;
    const worstTimeframe = sortedTimeframes[sortedTimeframes.length - 1] || null;

    return {
      bestPair,
      worstPair,
      bestTimeframe,
      worstTimeframe,
      pairs,
      timeframes,
      days,
      months,
    };
  }

  /**
   * Recharts Dataset Aggregation: Equity Curve, Daily/Monthly Profit, Win/Loss, Pair/Timeframe
   */
  async getCharts(userId, filters = {}) {
    const match = this.buildMatchFilter(userId, filters);
    const trades = await TradeLog.find(match).sort({ createdAt: 1 });

    // 1. Equity Curve
    const equityCurve = trades.map((trade, idx) => {
      const pnl = trade.balanceAfter - trade.balanceBefore;
      return {
        tradeIndex: idx + 1,
        date: new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        balance: parseFloat(trade.balanceAfter.toFixed(2)),
        pnl: parseFloat(pnl.toFixed(2)),
      };
    });

    // 2. Daily Profit
    const dailyMap = {};
    // 3. Monthly Profit
    const monthlyMap = {};

    trades.forEach((trade) => {
      const pnl = trade.balanceAfter - trade.balanceBefore;
      const d = new Date(trade.createdAt);
      const dayKey = d.toISOString().split('T')[0];
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      dailyMap[dayKey] = (dailyMap[dayKey] || 0) + pnl;
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + pnl;
    });

    const dailyProfit = Object.keys(dailyMap).map((date) => ({
      date,
      profit: parseFloat(dailyMap[date].toFixed(2)),
    }));

    const monthlyProfit = Object.keys(monthlyMap).map((month) => ({
      month,
      profit: parseFloat(monthlyMap[month].toFixed(2)),
    }));

    // 4. Win / Loss Pie
    const winsCount = trades.filter((t) => t.result === 'W').length;
    const lossesCount = trades.length - winsCount;
    const winLossDistribution = [
      { name: 'Wins', value: winsCount, color: '#10b981' },
      { name: 'Losses', value: lossesCount, color: '#f43f5e' },
    ];

    // 5. Performance by Pair & Timeframe
    const perf = await this.getPerformance(userId, filters);

    return {
      equityCurve,
      dailyProfit,
      monthlyProfit,
      winLossDistribution,
      pairPerformance: perf.pairs,
      timeframePerformance: perf.timeframes,
    };
  }

  /**
   * Filtered Trade History Journal
   */
  async getHistory(userId, filters = {}, pagination = { page: 1, limit: 50 }) {
    const match = this.buildMatchFilter(userId, filters);
    const page = parseInt(pagination.page || 1, 10);
    const limit = parseInt(pagination.limit || 50, 10);
    const skip = (page - 1) * limit;

    const trades = await TradeLog.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TradeLog.countDocuments(match);

    return {
      trades,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Export Trade Journal (CSV, Excel, PDF)
   */
  async exportData(userId, filters = {}, format = 'csv') {
    const match = this.buildMatchFilter(userId, filters);
    const trades = await TradeLog.find(match).sort({ createdAt: 1 });

    if (format === 'csv') {
      const headers = 'Trade #,Date/Time,Pair,Timeframe,Signal,Amount,Result,Balance Before,Balance After,P&L\n';
      const rows = trades
        .map((t, idx) => {
          const pnl = t.balanceAfter - t.balanceBefore;
          return `${idx + 1},"${new Date(t.createdAt).toISOString()}","${t.pair}","${t.timeframe}","${t.signal}",${t.amount},"${t.result}",${t.balanceBefore},${t.balanceAfter},${pnl.toFixed(2)}`;
        })
        .join('\n');
      return {
        contentType: 'text/csv',
        filename: `trading_journal_${Date.now()}.csv`,
        buffer: Buffer.from(headers + rows, 'utf-8'),
      };
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Trading Journal');

      worksheet.columns = [
        { header: 'Trade #', key: 'tradeNum', width: 10 },
        { header: 'Date / Time', key: 'date', width: 22 },
        { header: 'Pair', key: 'pair', width: 18 },
        { header: 'Timeframe', key: 'timeframe', width: 12 },
        { header: 'Signal', key: 'signal', width: 10 },
        { header: 'Amount ($/₹)', key: 'amount', width: 14 },
        { header: 'Result', key: 'result', width: 10 },
        { header: 'Balance Before', key: 'balanceBefore', width: 16 },
        { header: 'Balance After', key: 'balanceAfter', width: 16 },
        { header: 'P&L', key: 'pnl', width: 14 },
      ];

      trades.forEach((t, idx) => {
        const pnl = t.balanceAfter - t.balanceBefore;
        worksheet.addRow({
          tradeNum: idx + 1,
          date: new Date(t.createdAt).toLocaleString(),
          pair: t.pair,
          timeframe: t.timeframe,
          signal: t.signal,
          amount: t.amount,
          result: t.result,
          balanceBefore: t.balanceBefore,
          balanceAfter: t.balanceAfter,
          pnl: pnl,
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `trading_journal_${Date.now()}.xlsx`,
        buffer,
      };
    }

    if (format === 'pdf') {
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const buffers = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve({
            contentType: 'application/pdf',
            filename: `trading_journal_${Date.now()}.pdf`,
            buffer: pdfBuffer,
          });
        });
        doc.on('error', (err) => reject(err));

        // PDF Header
        doc.fontSize(18).text('Trading Assistant - Trade Journal Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(1.5);

        // Summary Table
        doc.fontSize(12).text(`Total Completed Trades: ${trades.length}`);
        doc.moveDown(1);

        // Trade Table Header
        doc.fontSize(9).text('#   Date/Time               Pair             Signal  Amount    Result   Balance After', { underline: true });
        doc.moveDown(0.5);

        trades.forEach((t, idx) => {
          const dateStr = new Date(t.createdAt).toLocaleDateString();
          doc.text(
            `${idx + 1}   ${dateStr.padEnd(16)} ${t.pair.padEnd(14)} ${t.signal.padEnd(6)} ₹${t.amount.toFixed(0)}     ${t.result}        ₹${t.balanceAfter.toFixed(0)}`
          );
        });

        doc.end();
      });
    }

    throw new AppError(`Unsupported export format: ${format}`, 400);
  }
}

export default new AnalyticsService();
