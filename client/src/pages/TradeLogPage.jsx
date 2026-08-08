import { useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
  Layers,
  FileSpreadsheet,
  FileText,
  FileCheck,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';
import TradeFilterModal, { DATE_PRESETS, PAIR_LIST, TIMEFRAME_LIST } from '../components/common/TradeFilterModal';
import useAuth from '../hooks/useAuth';
import { useAnalyticsHistory, useAnalyticsOverview } from '../hooks/useAnalytics';
import { analyticsService } from '../services/analyticsService';
import { getCurrencySymbol } from '../utils/formatters';



export const getDatePresetRange = (preset) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (preset) {
    case 'TODAY':
      return {
        startDate: todayStart.toISOString(),
        endDate: todayEnd.toISOString(),
      };
    case 'YESTERDAY': {
      const yestStart = new Date(todayStart);
      yestStart.setDate(yestStart.getDate() - 1);
      const yestEnd = new Date(todayEnd);
      yestEnd.setDate(yestEnd.getDate() - 1);
      return {
        startDate: yestStart.toISOString(),
        endDate: yestEnd.toISOString(),
      };
    }
    case 'THIS_WEEK': {
      const weekStart = new Date(todayStart);
      const dayOfWeek = weekStart.getDay();
      const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      weekStart.setDate(diff);
      return {
        startDate: weekStart.toISOString(),
        endDate: todayEnd.toISOString(),
      };
    }
    case 'THIS_MONTH': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      return {
        startDate: monthStart.toISOString(),
        endDate: todayEnd.toISOString(),
      };
    }
    case 'THIS_YEAR': {
      const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      return {
        startDate: yearStart.toISOString(),
        endDate: todayEnd.toISOString(),
      };
    }
    default:
      return { startDate: '', endDate: '' };
  }
};

const TradeLogPage = () => {
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.preferences?.currency || 'USD');

  // Filter State
  const [datePreset, setDatePreset] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedPair, setSelectedPair] = useState('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('ALL');
  const [selectedResult, setSelectedResult] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // UI State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Compute number of active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (datePreset !== 'ALL') count++;
    if (selectedPair !== 'ALL') count++;
    if (selectedTimeframe !== 'ALL') count++;
    if (selectedResult !== 'ALL') count++;
    if (sortBy !== 'newest') count++;
    return count;
  }, [datePreset, selectedPair, selectedTimeframe, selectedResult, sortBy]);

  // Computed Date Range Parameters
  const activeDateParams = useMemo(() => {
    if (datePreset === 'CUSTOM') {
      return {
        startDate: customStartDate ? new Date(customStartDate).toISOString() : '',
        endDate: customEndDate ? new Date(customEndDate).toISOString() : '',
      };
    }
    return getDatePresetRange(datePreset);
  }, [datePreset, customStartDate, customEndDate]);

  // Construct query object for React Query
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit,
    };
    if (activeDateParams.startDate) params.startDate = activeDateParams.startDate;
    if (activeDateParams.endDate) params.endDate = activeDateParams.endDate;
    if (selectedPair !== 'ALL') params.pair = selectedPair;
    if (selectedTimeframe !== 'ALL') params.timeframe = selectedTimeframe;
    if (selectedResult !== 'ALL') params.result = selectedResult;
    return params;
  }, [page, limit, activeDateParams, selectedPair, selectedTimeframe, selectedResult]);

  // Queries
  const {
    data: historyRes,
    isLoading: historyLoading,
    isRefetching,
    refetch,
  } = useAnalyticsHistory(queryParams);

  const { data: overviewRes } = useAnalyticsOverview(queryParams);

  const rawTrades = historyRes?.data?.trades || historyRes?.trades || [];
  const totalTradesCount = historyRes?.total || rawTrades.length;
  const totalPages = historyRes?.totalPages || Math.ceil(totalTradesCount / limit) || 1;
  const overview = overviewRes?.data?.overview || overviewRes?.overview || {};

  // Client-side filtering by search query & sorting
  const processedTrades = useMemo(() => {
    let list = [...rawTrades];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const symbolMatch = t.pair?.toLowerCase().includes(q);
        const tfMatch = t.timeframe?.toLowerCase().includes(q);
        const signalMatch = t.signal?.toLowerCase().includes(q);
        const resultMatch = (t.result === 'W' ? 'win' : 'loss').includes(q);
        const amountMatch = t.amount?.toString().includes(q);
        return symbolMatch || tfMatch || signalMatch || resultMatch || amountMatch;
      });
    }

    if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'highest_stake') {
      list.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    } else if (sortBy === 'highest_pnl') {
      list.sort((a, b) => (b.balanceAfter - b.balanceBefore) - (a.balanceAfter - a.balanceBefore));
    } else if (sortBy === 'lowest_pnl') {
      list.sort((a, b) => (a.balanceAfter - a.balanceBefore) - (b.balanceAfter - b.balanceBefore));
    } else {
      // default newest
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [rawTrades, searchQuery, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    setDatePreset('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setSelectedPair('ALL');
    setSelectedTimeframe('ALL');
    setSelectedResult('ALL');
    setSearchQuery('');
    setSortBy('newest');
    setPage(1);
  };

  // Export File Handler
  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      await analyticsService.exportFile(queryParams, format);
      setToast({ message: `Trade log successfully exported as ${format.toUpperCase()}!`, type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to export trade log file', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Trade Log & Ledger Audit
          </h1>
          <p className="text-sm text-slate-400">
            Comprehensive historical ledger of all executed trades, signals, stake sizes & P&L outcomes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin text-emerald-400' : ''}`} />
            Refresh
          </button>

          {/* Export Dropdown Group */}
          <div className="flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-1">
            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* OVERVIEW METRICS CARDS */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Trades"
          value={`${overview.totalTrades ?? totalTradesCount}`}
          change={`${overview.winningTrades ?? 0} Win / ${overview.losingTrades ?? 0} Loss`}
          isPositive={true}
          icon={Layers}
        />
        <StatCard
          title="Win Rate %"
          value={`${overview.winRate ?? 0}%`}
          change={`${overview.winningTrades ?? 0} Successful Executions`}
          isPositive={(overview.winRate || 0) >= 50}
          icon={Award}
        />
        <StatCard
          title="Net P&L"
          value={`${(overview.netProfit || 0) >= 0 ? '+' : ''}${currencySymbol} ${(overview.netProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change={`ROI: ${overview.roi ?? 0}%`}
          isPositive={(overview.netProfit || 0) >= 0}
          icon={TrendingUp}
        />
        <StatCard
          title="Avg Stake Volume"
          value={`${currencySymbol} ${(overview.averageStake || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change="Mean Position Size"
          isPositive={true}
          icon={Zap}
        />
        <StatCard
          title="Best Win Streak"
          value={`${overview.bestWinStreak ?? 0} Wins`}
          change={`Max Loss Streak: ${overview.worstLossStreak ?? 0}`}
          isPositive={true}
          icon={CheckCircle2}
        />
      </div>

      {/* COMPACT TOOLBAR & FILTER MODAL TRIGGER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pair, timeframe, signal, PnL..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Popup Window Trigger Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-md group"
          >
            <Filter className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Filter & Date Range</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 shadow-sm">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Reset All Filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE FILTER BADGES STRIP */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Active Filters:</span>
          {datePreset !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-400 font-medium">
              Date: {DATE_PRESETS.find((p) => p.id === datePreset)?.label}
              <XCircle
                className="h-3.5 w-3.5 cursor-pointer hover:text-white"
                onClick={() => setDatePreset('ALL')}
              />
            </span>
          )}
          {selectedPair !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-sky-400 font-medium">
              Pair: {selectedPair}
              <XCircle
                className="h-3.5 w-3.5 cursor-pointer hover:text-white"
                onClick={() => setSelectedPair('ALL')}
              />
            </span>
          )}
          {selectedTimeframe !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-indigo-400 font-medium">
              Timeframe: {selectedTimeframe}
              <XCircle
                className="h-3.5 w-3.5 cursor-pointer hover:text-white"
                onClick={() => setSelectedTimeframe('ALL')}
              />
            </span>
          )}
          {selectedResult !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-400 font-medium">
              Outcome: {selectedResult === 'W' ? 'WIN Only' : 'LOSS Only'}
              <XCircle
                className="h-3.5 w-3.5 cursor-pointer hover:text-white"
                onClick={() => setSelectedResult('ALL')}
              />
            </span>
          )}
        </div>
      )}

      {/* FILTER POPUP MODAL */}
      <TradeFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        selectedPair={selectedPair}
        setSelectedPair={setSelectedPair}
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
        selectedResult={selectedResult}
        setSelectedResult={setSelectedResult}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onReset={handleResetFilters}
      />

      {/* TRADES DATA TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-xs font-semibold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Time & Date</th>
                <th className="px-6 py-4">Asset Pair</th>
                <th className="px-6 py-4">Timeframe</th>
                <th className="px-6 py-4">Signal</th>
                <th className="px-6 py-4">Stake Amount</th>
                <th className="px-6 py-4">Outcome</th>
                <th className="px-6 py-4">Balance Before</th>
                <th className="px-6 py-4">Balance After</th>
                <th className="px-6 py-4">Net P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {historyLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-xs text-slate-400">
                    Loading historical trade log entries...
                  </td>
                </tr>
              ) : processedTrades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-xs text-slate-500">
                    No executed trades match your current filter selection.
                  </td>
                </tr>
              ) : (
                processedTrades.map((t) => {
                  const pnl = (t.balanceAfter ?? 0) - (t.balanceBefore ?? 0);
                  const isWin = t.result === 'W';
                  const signalDir = t.signal?.toUpperCase() || 'BUY';

                  return (
                    <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-white text-sm">{t.pair}</span>
                      </td>

                      <td className="px-6 py-4 text-xs font-mono text-slate-300">
                        {t.timeframe}
                      </td>

                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border ${
                            signalDir === 'BUY' || signalDir === 'UP'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {signalDir === 'BUY' || signalDir === 'UP' ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                          {signalDir}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono font-semibold text-white">
                        {currencySymbol} {t.amount?.toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={isWin ? 'success' : 'danger'}>
                          <span className="flex items-center gap-1">
                            {isWin ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                            {isWin ? 'WIN' : 'LOSS'}
                          </span>
                        </Badge>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {currencySymbol} {t.balanceBefore?.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-300">
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

        {/* PAGINATION CONTROLS FOOTER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-800 p-4 bg-slate-950/40 text-xs">
          <div className="flex items-center gap-4 text-slate-400">
            <span>
              Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalTradesCount} Total Records)
            </span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:0.8rem_0.8rem] bg-[right_0.5rem_center] bg-no-repeat pr-6 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer transition-all shadow-sm"
              >
                <option value={10} className="bg-slate-950 text-slate-200">10</option>
                <option value={25} className="bg-slate-950 text-slate-200">25</option>
                <option value={50} className="bg-slate-950 text-slate-200">50</option>
                <option value={100} className="bg-slate-950 text-slate-200">100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeLogPage;
