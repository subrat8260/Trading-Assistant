import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Zap,
  Activity,
  BarChart3,
  DollarSign,
  PieChart as PieIcon,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Flame,
  RefreshCw,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import AnalyticsFilterBar from '../components/analytics/AnalyticsFilterBar';
import {
  useAnalyticsOverview,
  useAnalyticsPerformance,
  useAnalyticsCharts,
  useAnalyticsHistory,
  ANALYTICS_KEYS,
} from '../hooks/useAnalytics';
import useAuth from '../hooks/useAuth';
import { getCurrencySymbol } from '../utils/formatters';
import MonthlyTradingCalendar from '../components/analytics/MonthlyTradingCalendar';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.preferences?.currency || 'USD');
  const queryClient = useQueryClient();

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    pair: 'ALL',
    timeframe: 'ALL',
    result: 'ALL',
  });

  const [page, setPage] = useState(1);

  // Auto hard refresh on page mount / navigation to Analytics page
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all });
  }, [queryClient]);

  // Hard Refresh Handler
  const handleHardRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all });
      await queryClient.refetchQueries({ queryKey: ANALYTICS_KEYS.all });
    } finally {
      setTimeout(() => setIsManualRefreshing(false), 500);
    }
  };

  // Active Filter Clean Object
  const cleanFilters = { ...filters };
  if (cleanFilters.pair === 'ALL') delete cleanFilters.pair;
  if (cleanFilters.timeframe === 'ALL') delete cleanFilters.timeframe;
  if (cleanFilters.result === 'ALL') delete cleanFilters.result;

  // React Query Hooks
  const { data: overviewRes, isLoading: overviewLoading } = useAnalyticsOverview(cleanFilters);
  const { data: perfRes, isLoading: perfLoading } = useAnalyticsPerformance(cleanFilters);
  const { data: chartsRes, isLoading: chartsLoading } = useAnalyticsCharts(cleanFilters);
  const { data: historyRes, isLoading: historyLoading } = useAnalyticsHistory({
    ...cleanFilters,
    page,
    limit: 25,
  });
  const { data: allTradesRes } = useAnalyticsHistory({
    ...cleanFilters,
    limit: 10000,
  });

  const overview = overviewRes?.data?.overview || {};
  const perf = perfRes?.data?.performance || {};
  const charts = chartsRes?.data?.charts || {};
  const historyData = historyRes?.data?.trades || [];
  const allTrades = allTradesRes?.data?.trades || [];
  const totalPages = historyRes?.totalPages || 1;

  const isLoading = overviewLoading || perfLoading || chartsLoading;

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Trading Journal & Analytics
          </h1>
          <p className="text-sm text-slate-400">
            TradingView-inspired performance stats, streak analysis, and interactive Recharts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleHardRefresh}
            disabled={isManualRefreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
            title="Hard Refresh Analytics Data"
          >
            <RefreshCw className={`h-4 w-4 text-emerald-400 ${isManualRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
          <Badge variant="success">Recharts Active</Badge>
          <Badge variant="info">Real-time Journal</Badge>
        </div>
      </div>

      {/* Filter Control Bar */}
      <AnalyticsFilterBar
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        onResetFilters={() => {
          setFilters({ startDate: '', endDate: '', pair: 'ALL', timeframe: 'ALL', result: 'ALL' });
          setPage(1);
        }}
      />

      {isLoading ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="mt-3 text-sm">Aggregating Trading Analytics Data...</p>
        </div>
      ) : (
        <>
          {/* SECTION 1: OVERVIEW METRICS GRID (16 STAT CARDS) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Trades"
              value={overview.totalTrades ?? 0}
              change={`${overview.winningTrades || 0} Wins / ${overview.losingTrades || 0} Losses`}
              isPositive={true}
              icon={Activity}
            />

            <StatCard
              title="Win Rate %"
              value={`${overview.winRate ?? 0}%`}
              change={`Loss Rate: ${overview.lossRate ?? 0}%`}
              isPositive={(overview.winRate || 0) >= 50}
              icon={Award}
            />

            <StatCard
              title="Net Profit"
              value={`${(overview.netProfit || 0) >= 0 ? '+' : ''}${currencySymbol} ${(overview.netProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              change={`ROI: ${overview.roi ?? 0}%`}
              isPositive={(overview.netProfit || 0) >= 0}
              icon={DollarSign}
            />

            <StatCard
              title="Largest Drawdown"
              value={`${overview.largestDrawdown ?? 0}%`}
              change="Peak-to-Trough Exposure"
              isPositive={(overview.largestDrawdown || 0) < 15}
              icon={Shield}
            />

            <StatCard
              title="Current Streak"
              value={
                overview.currentWinStreak > 0
                  ? `${overview.currentWinStreak} WIN`
                  : overview.currentLossStreak > 0
                  ? `${overview.currentLossStreak} LOSS`
                  : '0'
              }
              change={overview.currentWinStreak > 0 ? 'Active Win Streak' : 'Active Loss Streak'}
              isPositive={overview.currentWinStreak > 0}
              icon={Flame}
            />

            <StatCard
              title="Best Win Streak"
              value={`${overview.bestWinStreak ?? 0} Wins`}
              change="Consecutive Wins Record"
              isPositive={true}
              icon={Award}
            />

            <StatCard
              title="Worst Loss Streak"
              value={`${overview.worstLossStreak ?? 0} Losses`}
              change="Max Consecutive Losses"
              isPositive={false}
              icon={Shield}
            />

            <StatCard
              title="ROI %"
              value={`${(overview.roi || 0) >= 0 ? '+' : ''}${overview.roi ?? 0}%`}
              change="Return on Initial Capital"
              isPositive={(overview.roi || 0) >= 0}
              icon={TrendingUp}
            />

            <StatCard
              title="Total Gross Profit"
              value={`${currencySymbol} ${(overview.totalProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              change="Cumulative Profit"
              isPositive={true}
              icon={DollarSign}
            />

            <StatCard
              title="Total Gross Loss"
              value={`${currencySymbol} ${(overview.totalLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              change="Cumulative Losses"
              isPositive={false}
              icon={DollarSign}
            />

            <StatCard
              title="Average Stake"
              value={`${currencySymbol} ${(overview.averageStake || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              change="Mean Position Size"
              isPositive={true}
              icon={Zap}
            />

            <StatCard
              title="Largest Stake"
              value={`${currencySymbol} ${(overview.largestStake || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              change="Peak Stake Executed"
              isPositive={true}
              icon={Zap}
            />
          </div>

          {/* SECTION 2: PERFORMANCE HIGHLIGHTS */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-emerald-500/30 bg-slate-900/80 p-4 shadow-md backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Best Performing Pair</span>
              <h3 className="mt-1 text-lg font-bold text-white">{perf.bestPair?.name || 'N/A'}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Net Profit: <span className="font-bold text-emerald-400">{currencySymbol} {perf.bestPair?.netProfit || 0}</span> ({perf.bestPair?.winRate || 0}% Win Rate)
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-slate-900/80 p-4 shadow-md backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Worst Performing Pair</span>
              <h3 className="mt-1 text-lg font-bold text-white">{perf.worstPair?.name || 'N/A'}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Net Profit: <span className="font-bold text-rose-400">{currencySymbol} {perf.worstPair?.netProfit || 0}</span> ({perf.worstPair?.winRate || 0}% Win Rate)
              </p>
            </div>

            <div className="rounded-xl border border-indigo-500/30 bg-slate-900/80 p-4 shadow-md backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Best Timeframe</span>
              <h3 className="mt-1 text-lg font-bold text-white">{perf.bestTimeframe?.name || 'N/A'}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Net Profit: <span className="font-bold text-emerald-400">{currencySymbol} {perf.bestTimeframe?.netProfit || 0}</span> ({perf.bestTimeframe?.winRate || 0}% Win Rate)
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-slate-900/80 p-4 shadow-md backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Worst Timeframe</span>
              <h3 className="mt-1 text-lg font-bold text-white">{perf.worstTimeframe?.name || 'N/A'}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Net Profit: <span className="font-bold text-rose-400">{currencySymbol} {perf.worstTimeframe?.netProfit || 0}</span> ({perf.worstTimeframe?.winRate || 0}% Win Rate)
              </p>
            </div>
          </div>

          {/* MONTHLY TRADING CALENDAR (REFERENCE MATCH) */}
          <MonthlyTradingCalendar trades={allTrades} />

          {/* SECTION 3: RECHARTS INTERACTIVE SUITE */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* EQUITY CURVE (2 COLS) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 font-bold text-white">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Equity Curve (Portfolio Growth)
                </div>
                <span className="text-xs text-slate-400">Real-time Balance Stream</span>
              </div>

              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.equityCurve || []}>
                    <defs>
                      <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f2937', borderRadius: '12px', color: '#fff' }}
                      formatter={(val) => [`${currencySymbol} ${val.toLocaleString()}`, 'Portfolio Balance']}
                    />
                    <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* WIN / LOSS DISTRIBUTION PIE CHART */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 font-bold text-white">
                  <PieIcon className="h-5 w-5 text-indigo-400" />
                  Win / Loss Distribution
                </div>
              </div>

              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.winLossDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(charts.winLossDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f2937', borderRadius: '12px', color: '#fff' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SECOND CHARTS ROW: DAILY PROFIT & PAIR PERFORMANCE */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* DAILY NET PROFIT BARS */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 font-bold text-white">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                  Daily Net Profit / Loss
                </div>
              </div>

              <div className="mt-6 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.dailyProfit || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f2937', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="profit" name="Net Profit (₹)">
                      {(charts.dailyProfit || []).map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PAIR PERFORMANCE BARS */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 font-bold text-white">
                  <BarChart3 className="h-5 w-5 text-indigo-400" />
                  Pair Net Profit Breakdown
                </div>
              </div>

              <div className="mt-6 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.pairPerformance || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f2937', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="netProfit" name="Net Profit (₹)">
                      {(charts.pairPerformance || []).map((entry, index) => (
                        <Cell key={`pair-bar-${index}`} fill={entry.netProfit >= 0 ? '#6366f1' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SECTION 4: TRADE JOURNAL HISTORY TABLE */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h2 className="text-lg font-bold text-white">Trading Journal Log</h2>
                <p className="text-xs text-slate-400">Filtered historical trade audit entries</p>
              </div>
              <Badge variant="neutral">Page {page} of {totalPages}</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-xs font-semibold uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-3.5">Time</th>
                    <th className="px-6 py-3.5">Pair</th>
                    <th className="px-6 py-3.5">Timeframe</th>
                    <th className="px-6 py-3.5">Signal</th>
                    <th className="px-6 py-3.5">Stake Amount</th>
                    <th className="px-6 py-3.5">Result</th>
                    <th className="px-6 py-3.5">Balance Before</th>
                    <th className="px-6 py-3.5">Balance After</th>
                    <th className="px-6 py-3.5">Net P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {historyLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-xs text-slate-400">
                        Loading trade journal entries...
                      </td>
                    </tr>
                  ) : historyData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-xs text-slate-500">
                        No trade journal entries match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    historyData.map((t) => {
                      const pnl = t.balanceAfter - t.balanceBefore;
                      return (
                        <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {new Date(t.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-semibold text-white">{t.pair}</td>
                          <td className="px-6 py-4 text-xs font-mono">{t.timeframe}</td>
                          <td className="px-6 py-4">
                            <Badge variant={t.signal === 'BUY' || t.signal === 'UP' ? 'success' : 'danger'}>
                              {t.signal}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 font-mono font-medium text-emerald-400">
                            {currencySymbol} {t.amount?.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={t.result === 'W' ? 'success' : 'danger'}>
                              {t.result === 'W' ? 'WIN' : 'LOSS'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-400">
                            {currencySymbol} {t.balanceBefore?.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 font-mono text-white font-semibold">
                            {currencySymbol} {t.balanceAfter?.toFixed(2)}
                          </td>
                          <td
                            className={`px-6 py-4 font-mono font-bold ${
                              pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {pnl >= 0 ? `+${currencySymbol} ${pnl.toFixed(2)}` : `-${currencySymbol} ${Math.abs(pnl).toFixed(2)}`}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-slate-800 p-4">
              <span className="text-xs text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
