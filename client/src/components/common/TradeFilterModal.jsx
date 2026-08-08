import { X, Filter, RotateCcw, Check, Calendar } from 'lucide-react';

export const DATE_PRESETS = [
  { id: 'ALL', label: 'All Time' },
  { id: 'TODAY', label: 'Today' },
  { id: 'YESTERDAY', label: 'Yesterday' },
  { id: 'THIS_WEEK', label: 'This Week' },
  { id: 'THIS_MONTH', label: 'This Month' },
  { id: 'THIS_YEAR', label: 'This Year' },
  { id: 'CUSTOM', label: 'Custom Range' },
];

export const PAIR_LIST = [
  'ALL',
  'USD/BRL (OTC)',
  'USD/ARS (OTC)',
  'USD/BDT (OTC)',
  'USD/DZD (OTC)',
  'USD/EGP (OTC)',
  'USD/INR (OTC)',
  'EUR/SGD (OTC)',
  'GBP/NZD (OTC)',
  'NZD/CAD (OTC)',
  'AUD/JPY (OTC)',
  'EUR/GBP (OTC)',
  'NZD/JPY (OTC)',
  'USD/JPY (OTC)',
  'EUR/USD (OTC)',
  'AUD/NZD (OTC)',
  'USD/TRY (OTC)',
  'AUD/USD (OTC)',
  'CAD/CHF (OTC)',
  'EUR/JPY (OTC)',
  'GBP/USD (OTC)',
  'AUD/CAD (OTC)',
  'GBP/CHF (OTC)',
  'EUR/CAD (OTC)',
  'EUR/CHF (OTC)',
  'GBP/AUD (OTC)',
  'USD/CAD (OTC)',
  'USD/IDR (OTC)',
  'USD/PKR (OTC)',
  'USD/MXN (OTC)',
  'USD/PHP (OTC)',
  'USD/NGN (OTC)',
  'CHF/JPY (OTC)',
  'EUR/AUD (OTC)',
  'GBP/CAD (OTC)',
  'GBP/JPY (OTC)',
  'NZD/USD (OTC)',
  'USD/ZAR (OTC)',
  'USD/COP (OTC)',
  'NZD/CHF (OTC)',
  'Dogecoin (OTC)',
  'Bitcoin (OTC)',
  'Pepe (OTC)',
  'USCrude (OTC)',
  'Silver (OTC)',
  'UKBrent (OTC)',
  'Gold (OTC)',
  'JOHNSON & JOHNSON (OTC)',
  'MCDONALDS (OTC)',
  'MICROSOFT (OTC)',
  'BOEING COMPANY (OTC)',
  'AMERICAN EXPRESS (OTC)',
  'FACEBOOK INC (OTC)',
  'INTEL (OTC)',
  'PFIZER INC (OTC)',
  'IBEX 35 (OTC)',
];

export const TIMEFRAME_LIST = ['ALL', '00:05', '00:10', '00:15', '00:30', '01:00', '02:00', '05:00', '10:00', '30:00', '59:00'];

const TradeFilterModal = ({
  isOpen,
  onClose,
  datePreset,
  setDatePreset,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  selectedPair,
  setSelectedPair,
  selectedTimeframe,
  setSelectedTimeframe,
  selectedResult,
  setSelectedResult,
  sortBy,
  setSortBy,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Filter className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Filter Trade Logs</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Date Filter Presets */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-emerald-400" />
            Date Filter Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => {
              const isActive = datePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDatePreset(preset.id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {datePreset === 'CUSTOM' && (
          <div className="grid gap-3 sm:grid-cols-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Filtering Dropdowns Grid */}
        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-800/80">
          {/* Pair Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Asset Pair
            </label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:0.9rem_0.9rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
            >
              {PAIR_LIST.map((pair) => (
                <option key={pair} value={pair} className="bg-slate-950 text-slate-200">
                  {pair}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Expiration Timeframe
            </label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:0.9rem_0.9rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
            >
              {TIMEFRAME_LIST.map((tf) => (
                <option key={tf} value={tf} className="bg-slate-950 text-slate-200">
                  {tf === 'ALL' ? 'All Timeframes' : tf}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Outcome Result
            </label>
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:0.9rem_0.9rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
            >
              <option value="ALL" className="bg-slate-950 text-slate-200">All Outcomes (WIN & LOSS)</option>
              <option value="W" className="bg-slate-950 text-slate-200">WIN Only</option>
              <option value="L" className="bg-slate-950 text-slate-200">LOSS Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:0.9rem_0.9rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
            >
              <option value="newest" className="bg-slate-950 text-slate-200">Newest First</option>
              <option value="oldest" className="bg-slate-950 text-slate-200">Oldest First</option>
              <option value="highest_stake" className="bg-slate-950 text-slate-200">Highest Stake</option>
              <option value="highest_pnl" className="bg-slate-950 text-slate-200">Highest P&L</option>
              <option value="lowest_pnl" className="bg-slate-950 text-slate-200">Lowest P&L</option>
            </select>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-slate-800 hover:text-rose-300 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            Reset All Filters
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
          >
            <Check className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeFilterModal;
