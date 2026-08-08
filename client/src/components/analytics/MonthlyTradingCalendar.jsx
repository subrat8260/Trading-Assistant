import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Edit3,
  Check,
} from 'lucide-react';
import { getCurrencySymbol } from '../../utils/formatters';
import useAuth from '../../hooks/useAuth';

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const formatCompactCurrency = (val, symbol) => {
  const absVal = Math.abs(val);
  const sign = val >= 0 ? '+' : '-';
  if (absVal >= 1000000) {
    return `${sign}${symbol}${(absVal / 1000000).toFixed(1)}M`;
  }
  if (absVal >= 1000) {
    return `${sign}${symbol}${(absVal / 1000).toFixed(1)}k`;
  }
  return `${sign}${symbol}${absVal.toFixed(0)}`;
};

const MonthlyTradingCalendar = ({ trades = [] }) => {
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.preferences?.currency || 'USD');

  // Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Month'); // Week | Month | Year | All time

  // Monthly Goal State
  const [monthlyGoal, setMonthlyGoal] = useState(3000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalInput, setTempGoalInput] = useState('3000');

  // Active Hovered/Tapped Day for Tooltip
  const [hoveredDayData, setHoveredDayData] = useState(null);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Map trades to days of the selected month
  const calendarDaysData = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    const daysMap = {};

    // Initialize all days of month
    for (let day = 1; day <= totalDays; day++) {
      daysMap[day] = {
        day,
        totalTrades: 0,
        winTrades: 0,
        lossTrades: 0,
        netPnL: 0,
        totalStake: 0,
        dateObj: new Date(year, month, day),
      };
    }

    // Process trade log array
    trades.forEach((t) => {
      if (!t.createdAt) return;
      const tDate = new Date(t.createdAt);
      if (tDate.getFullYear() === year && tDate.getMonth() === month) {
        const day = tDate.getDate();
        const isWin = t.result === 'W';
        let tradePnL = 0;

        if (isWin) {
          const gain = (t.balanceAfter ?? 0) - (t.balanceBefore ?? 0);
          tradePnL = gain > 0 ? gain : (t.amount || 0) * 0.82;
        } else {
          const loss = (t.balanceBefore ?? 0) - (t.balanceAfter ?? 0);
          tradePnL = loss > 0 ? -loss : -(t.amount || 0);
        }

        daysMap[day].totalTrades += 1;
        if (isWin) {
          daysMap[day].winTrades += 1;
        } else {
          daysMap[day].lossTrades += 1;
        }
        daysMap[day].netPnL += tradePnL;
        daysMap[day].totalStake += t.amount || 0;
      }
    });

    return daysMap;
  }, [trades, year, month]);

  // Compute total monthly PnL for summary cards
  const totalMonthlyPnL = useMemo(() => {
    return Object.values(calendarDaysData).reduce((sum, d) => sum + d.netPnL, 0);
  }, [calendarDaysData]);

  // Compute padding offset for the 1st day of the month (Monday = 0 ... Sunday = 6)
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Goal progress calculation
  const goalProgress = Math.min(100, Math.max(0, (totalMonthlyPnL / (monthlyGoal || 1)) * 100));

  const handleSaveGoal = () => {
    const val = parseFloat(tempGoalInput);
    if (!isNaN(val) && val > 0) {
      setMonthlyGoal(val);
    }
    setIsEditingGoal(false);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5 sm:space-y-6">
      {/* HEADER ROW: VIEW SWITCHER & MONTH NAV */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1 overflow-x-auto">
          {['Week', 'Month', 'Year', 'All time'].map((tab) => {
            const isActive = viewMode === tab;
            return (
              <button
                key={tab}
                onClick={() => setViewMode(tab)}
                className={`rounded-lg px-3 sm:px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            onClick={handlePrevMonth}
            className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide min-w-[140px] sm:min-w-[160px] text-center truncate">
            {monthName} {year}
          </h2>
          <button
            onClick={handleNextMonth}
            className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* TOP SUMMARY CARDS ROW */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        {/* Card 1: Total P&L */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total P&L ({monthName})
          </span>
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight mt-2 ${
              totalMonthlyPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalMonthlyPnL >= 0 ? '+' : ''}
            {currencySymbol} {totalMonthlyPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 2: Monthly Goal */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
              Monthly Goal Target
            </span>
            {isEditingGoal ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={tempGoalInput}
                  onChange={(e) => setTempGoalInput(e.target.value)}
                  className="w-20 sm:w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
                <button
                  onClick={handleSaveGoal}
                  className="rounded-lg bg-emerald-500 p-1 text-slate-950 hover:bg-emerald-400"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempGoalInput(monthlyGoal.toString());
                  setIsEditingGoal(true);
                }}
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                title="Edit Goal"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-3 space-y-2">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-950 p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-400">
                {currencySymbol} {Math.max(0, totalMonthlyPnL).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
              <span className="text-slate-400">
                {currencySymbol} {monthlyGoal.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CALENDAR DAYS MATRIX GRID */}
      <div className="space-y-2 sm:space-y-3 overflow-x-auto pb-1">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400">
          {DAYS_OF_WEEK.map((dayName) => (
            <div key={dayName} className="py-1">
              <span className="hidden sm:inline">{dayName}</span>
              <span className="sm:hidden">{dayName.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Day Box Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Offset Padding Cells for 1st day of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div
              key={`offset-${idx}`}
              className="min-h-[55px] sm:min-h-[95px] rounded-xl sm:rounded-2xl border border-dashed border-slate-900/50 bg-slate-950/20"
            />
          ))}

          {/* Actual Calendar Days */}
          {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayData = calendarDaysData[dayNum];
            const hasTrades = dayData.totalTrades > 0;
            const isProfit = dayData.netPnL > 0;
            const isLoss = dayData.netPnL < 0;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => setHoveredDayData(hoveredDayData?.day === dayNum ? null : dayData)}
                onMouseEnter={() => setHoveredDayData(dayData)}
                onMouseLeave={() => setHoveredDayData(null)}
                className={`relative min-h-[55px] sm:min-h-[95px] rounded-xl sm:rounded-2xl p-1 sm:p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-md group ${
                  hasTrades
                    ? isProfit
                      ? 'bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-400/50 text-white shadow-emerald-900/20 hover:scale-[1.02]'
                      : isLoss
                      ? 'bg-rose-600/90 hover:bg-rose-500 border border-rose-400/50 text-white shadow-rose-900/20 hover:scale-[1.02]'
                      : 'bg-slate-800 border border-slate-700 text-white hover:scale-[1.02]'
                    : 'bg-slate-950/80 border border-slate-800/80 text-slate-500 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                {/* Top Row: Calendar Icon & Day Number */}
                <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold leading-none">
                  <div className="flex items-center gap-0.5 sm:gap-1 opacity-90">
                    <CalendarIcon className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                    <span>{dayNum}</span>
                  </div>
                  {hasTrades && (
                    <span className="sm:hidden text-[9px] font-extrabold px-1 rounded bg-black/40 text-emerald-300">
                      {dayData.totalTrades}
                    </span>
                  )}
                </div>

                {/* Middle Row: P&L Amount */}
                <div className="my-0.5 text-center overflow-hidden">
                  {hasTrades ? (
                    <>
                      {/* Desktop / Tablet Full Display */}
                      <div className="hidden sm:block text-xs md:text-sm font-black tracking-tight truncate drop-shadow-sm">
                        {isProfit ? '+' : ''}
                        {currencySymbol} {dayData.netPnL.toFixed(2)}
                      </div>
                      {/* Mobile Compact Display */}
                      <div className="sm:hidden text-[10px] font-black tracking-tight truncate drop-shadow-sm">
                        {formatCompactCurrency(dayData.netPnL, currencySymbol)}
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] sm:text-sm font-bold text-slate-600">—</div>
                  )}
                </div>

                {/* Bottom Row: Trades Count (Tablet / Desktop) */}
                <div className="hidden sm:block text-center text-[10px] font-semibold opacity-90 truncate">
                  {hasTrades
                    ? `${dayData.totalTrades} trade${dayData.totalTrades > 1 ? 's' : ''}`
                    : 'No trades'}
                </div>

                {/* HOVER / TAP TOOLTIP POPUP */}
                {hoveredDayData?.day === dayNum && hasTrades && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 sm:w-52 rounded-2xl border border-slate-700 bg-slate-950/95 p-3 sm:p-3.5 shadow-2xl backdrop-blur-2xl text-xs space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="font-bold text-white border-b border-slate-800 pb-1 flex justify-between items-center">
                      <span>{monthName} {dayNum}, {year}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {isProfit ? 'PROFIT' : 'LOSS'}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-300 font-medium">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Net P&L:</span>
                        <span className={`font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}{currencySymbol} {dayData.netPnL.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Trades:</span>
                        <span className="font-bold text-white">{dayData.totalTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Wins / Losses:</span>
                        <span className="font-bold text-white">
                          <span className="text-emerald-400">{dayData.winTrades}W</span> / <span className="text-rose-400">{dayData.lossTrades}L</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Win Rate:</span>
                        <span className="font-bold text-indigo-400">
                          {((dayData.winTrades / dayData.totalTrades) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyTradingCalendar;
