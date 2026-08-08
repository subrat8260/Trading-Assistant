import { useState } from 'react';
import {
  Filter,
  Download,
  Calendar,
  RefreshCw,
  Globe,
  Clock,
  Award,
  X,
  ChevronDown,
} from 'lucide-react';
import analyticsService from '../../services/analyticsService';

const PAIRS = [
  'ALL',
  'USD/BDT (OTC)',
  'EUR/USD (OTC)',
  'USD/BRL (OTC)',
  'USD/INR (OTC)',
  'GBP/USD (OTC)',
  'AUD/JPY (OTC)',
  'Gold (OTC)',
  'Bitcoin (OTC)',
];

const TIMEFRAMES = ['ALL', '01:00', '00:05', '00:15', '00:30', '02:00', '05:00', '10:00'];

const DATE_PRESETS = [
  { label: 'All Time', key: 'all' },
  { label: 'Today', key: 'today' },
  { label: 'Yesterday', key: 'yesterday' },
  { label: 'Last 7 Days', key: 'last7' },
  { label: 'Last 30 Days', key: 'last30' },
  { label: 'This Month', key: 'thisMonth' },
  { label: 'Last Month', key: 'lastMonth' },
];

const formatDateStr = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getPresetDates = (presetKey) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (presetKey === 'today') {
    const s = formatDateStr(today);
    return { startDate: s, endDate: s };
  }
  if (presetKey === 'yesterday') {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    const s = formatDateStr(y);
    return { startDate: s, endDate: s };
  }
  if (presetKey === 'last7') {
    const s7 = new Date(today);
    s7.setDate(s7.getDate() - 6);
    return { startDate: formatDateStr(s7), endDate: formatDateStr(today) };
  }
  if (presetKey === 'last30') {
    const s30 = new Date(today);
    s30.setDate(s30.getDate() - 29);
    return { startDate: formatDateStr(s30), endDate: formatDateStr(today) };
  }
  if (presetKey === 'thisMonth') {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startDate: formatDateStr(firstDay), endDate: formatDateStr(today) };
  }
  if (presetKey === 'lastMonth') {
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    return { startDate: formatDateStr(firstDayLastMonth), endDate: formatDateStr(lastDayLastMonth) };
  }
  return { startDate: '', endDate: '' };
};

const AnalyticsFilterBar = ({ filters, onFilterChange, onResetFilters }) => {
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activePreset, setActivePreset] = useState('all');

  const handlePresetSelect = (presetKey) => {
    setActivePreset(presetKey);
    if (presetKey === 'all') {
      onFilterChange({ ...filters, startDate: '', endDate: '' });
    } else {
      const dates = getPresetDates(presetKey);
      onFilterChange({ ...filters, startDate: dates.startDate, endDate: dates.endDate });
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const activeFilters = { ...filters };
      if (activeFilters.pair === 'ALL') delete activeFilters.pair;
      if (activeFilters.timeframe === 'ALL') delete activeFilters.timeframe;
      if (activeFilters.result === 'ALL') delete activeFilters.result;

      await analyticsService.exportFile(activeFilters, format);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // Count active filters
  const activeFilterCount = [
    filters.startDate || filters.endDate,
    filters.pair && filters.pair !== 'ALL',
    filters.timeframe && filters.timeframe !== 'ALL',
    filters.result && filters.result !== 'ALL',
  ].filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl space-y-4">
      {/* HEADER & MAIN FILTER ROW */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-slate-950">
                {activeFilterCount}
              </span>
            )}
          </div>

          {/* PAIR SELECTOR */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <select
              value={filters.pair || 'ALL'}
              onChange={(e) => onFilterChange({ ...filters, pair: e.target.value })}
              className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-950/90 pl-8 pr-8 py-2 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer transition-all shadow-inner appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:0.85rem_0.85rem] bg-[right_0.6rem_center] bg-no-repeat"
            >
              {PAIRS.map((pair) => (
                <option key={pair} value={pair} className="bg-slate-950 text-slate-200">
                  {pair === 'ALL' ? 'All Asset Pairs' : pair}
                </option>
              ))}
            </select>
          </div>

          {/* TIMEFRAME SELECTOR */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <select
              value={filters.timeframe || 'ALL'}
              onChange={(e) => onFilterChange({ ...filters, timeframe: e.target.value })}
              className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-950/90 pl-8 pr-8 py-2 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer transition-all shadow-inner appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:0.85rem_0.85rem] bg-[right_0.6rem_center] bg-no-repeat"
            >
              {TIMEFRAMES.map((tf) => (
                <option key={tf} value={tf} className="bg-slate-950 text-slate-200">
                  {tf === 'ALL' ? 'All Timeframes' : tf}
                </option>
              ))}
            </select>
          </div>

          {/* OUTCOME / RESULT SELECTOR */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Award className="h-3.5 w-3.5" />
            </div>
            <select
              value={filters.result || 'ALL'}
              onChange={(e) => onFilterChange({ ...filters, result: e.target.value })}
              className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-950/90 pl-8 pr-8 py-2 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer transition-all shadow-inner appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:0.85rem_0.85rem] bg-[right_0.6rem_center] bg-no-repeat"
            >
              <option value="ALL" className="bg-slate-950 text-slate-200">All Outcomes</option>
              <option value="W" className="bg-slate-950 text-emerald-400 font-bold">Wins Only (WIN)</option>
              <option value="L" className="bg-slate-950 text-rose-400 font-bold">Losses Only (LOSS)</option>
            </select>
          </div>

          {/* RESET BUTTON */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setActivePreset('all');
                onResetFilters();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-400 hover:border-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset All
            </button>
          )}
        </div>

        {/* EXPORT ACTION BUTTON */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu((prev) => !prev)}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-emerald-400 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? 'Exporting...' : 'Export Report'}</span>
            <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 mb-1">
                Select Export Format
              </div>
              <button
                onClick={() => handleExport('csv')}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-emerald-400 transition-colors"
              >
                <span>Export CSV (.csv)</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-emerald-400 transition-colors"
              >
                <span>Export Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-emerald-400 transition-colors"
              >
                <span>Export PDF Report</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QUICK DATE RANGE PRESET CHIPS & CALENDAR SELECTOR */}
      <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* PRESET CHIPS */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-emerald-400" /> Date Preset:
          </span>
          {DATE_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.key;
            return (
              <button
                key={preset.key}
                onClick={() => handlePresetSelect(preset.key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all shadow-sm ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* CUSTOM CALENDAR DATE PICKER */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs">
          <span className="text-[11px] font-medium text-slate-400">Custom Range:</span>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => {
              setActivePreset('custom');
              onFilterChange({ ...filters, startDate: e.target.value });
            }}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer [color-scheme:dark] text-xs"
            title="Start Date"
          />
          <span className="text-slate-600 font-bold">-</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => {
              setActivePreset('custom');
              onFilterChange({ ...filters, endDate: e.target.value });
            }}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer [color-scheme:dark] text-xs"
            title="End Date"
          />
          {(filters.startDate || filters.endDate) && (
            <button
              onClick={() => {
                setActivePreset('all');
                onFilterChange({ ...filters, startDate: '', endDate: '' });
              }}
              className="ml-1 text-slate-500 hover:text-rose-400 transition-colors"
              title="Clear Date Range"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilterBar;
