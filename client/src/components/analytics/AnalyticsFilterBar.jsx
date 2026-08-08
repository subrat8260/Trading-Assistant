import { useState } from 'react';
import { Filter, Download, Calendar, RefreshCw } from 'lucide-react';
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

const AnalyticsFilterBar = ({ filters, onFilterChange, onResetFilters }) => {
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Filter className="h-4 w-4 text-emerald-400" />
          Filters
        </div>

        {/* Date Range Inputs */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="bg-transparent text-slate-200 focus:outline-none"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="bg-transparent text-slate-200 focus:outline-none"
          />
        </div>

        {/* Pair Filter Dropdown */}
        <select
          value={filters.pair || 'ALL'}
          onChange={(e) => onFilterChange({ ...filters, pair: e.target.value })}
          className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:0.9rem_0.9rem] bg-[right_0.6rem_center] bg-no-repeat pr-8"
        >
          {PAIRS.map((pair) => (
            <option key={pair} value={pair} className="bg-slate-950 text-slate-200">
              {pair === 'ALL' ? 'All Pairs' : pair}
            </option>
          ))}
        </select>

        {/* Timeframe Filter Dropdown */}
        <select
          value={filters.timeframe || 'ALL'}
          onChange={(e) => onFilterChange({ ...filters, timeframe: e.target.value })}
          className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:0.9rem_0.9rem] bg-[right_0.6rem_center] bg-no-repeat pr-8"
        >
          {TIMEFRAMES.map((tf) => (
            <option key={tf} value={tf} className="bg-slate-950 text-slate-200">
              {tf === 'ALL' ? 'All Timeframes' : tf}
            </option>
          ))}
        </select>

        {/* Result Filter Dropdown */}
        <select
          value={filters.result || 'ALL'}
          onChange={(e) => onFilterChange({ ...filters, result: e.target.value })}
          className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:0.9rem_0.9rem] bg-[right_0.6rem_center] bg-no-repeat pr-8"
        >
          <option value="ALL" className="bg-slate-950 text-slate-200">All Outcomes</option>
          <option value="W" className="bg-slate-950 text-slate-200">Wins Only (W)</option>
          <option value="L" className="bg-slate-950 text-slate-200">Losses Only (L)</option>
        </select>

        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          title="Reset Filters"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* Export Dropdown Menu */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu((prev) => !prev)}
          disabled={exporting}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting ? 'Exporting...' : 'Export Report'}
        </button>

        {showExportMenu && (
          <div className="absolute right-0 top-full mt-2 z-40 w-44 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => handleExport('csv')}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-emerald-400"
            >
              Export CSV (.csv)
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-emerald-400"
            >
              Export Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-emerald-400"
            >
              Export PDF Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsFilterBar;
