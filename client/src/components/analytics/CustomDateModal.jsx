import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, X, Check, RefreshCw } from 'lucide-react';

const DATE_PRESETS = [
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

const CustomDateModal = ({ isOpen, onClose, startDate, endDate, onApply, onReset }) => {
  const [tempStart, setTempStart] = useState(startDate || '');
  const [tempEnd, setTempEnd] = useState(endDate || '');
  const [activePreset, setActivePreset] = useState('custom');

  useEffect(() => {
    setTempStart(startDate || '');
    setTempEnd(endDate || '');
  }, [startDate, endDate, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (key) => {
    setActivePreset(key);
    const dates = getPresetDates(key);
    setTempStart(dates.startDate);
    setTempEnd(dates.endDate);
  };

  const handleApply = () => {
    onApply(tempStart, tempEnd, activePreset);
    onClose();
  };

  const handleClear = () => {
    setTempStart('');
    setTempEnd('');
    setActivePreset('all');
    onReset();
    onClose();
  };

  // Calculate day difference for display
  let dayDiff = 0;
  if (tempStart && tempEnd) {
    const d1 = new Date(tempStart);
    const d2 = new Date(tempEnd);
    const timeDiff = Math.abs(d2.getTime() - d1.getTime());
    dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select Date Range</h3>
              <p className="text-xs text-slate-400">Filter trade journal entries by specific dates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Preset Buttons */}
        <div className="mt-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Quick Date Presets
          </span>
          <div className="grid grid-cols-3 gap-2">
            {DATE_PRESETS.map((preset) => {
              const isSelected = activePreset === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => handleSelectPreset(preset.key)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all text-center shadow-sm ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10 font-bold'
                      : 'bg-slate-950/70 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Calendar Inputs */}
        <div className="mt-5 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Custom Calendar Selector
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
              <label className="text-[10px] font-semibold uppercase text-slate-400 block">
                Start Date
              </label>
              <input
                type="date"
                value={tempStart}
                onChange={(e) => {
                  setActivePreset('custom');
                  setTempStart(e.target.value);
                }}
                className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
              <label className="text-[10px] font-semibold uppercase text-slate-400 block">
                End Date
              </label>
              <input
                type="date"
                value={tempEnd}
                onChange={(e) => {
                  setActivePreset('custom');
                  setTempEnd(e.target.value);
                }}
                className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Selected Range Preview */}
        {(tempStart || tempEnd) && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
            <span className="text-xs font-semibold text-emerald-300 block">
              {tempStart} &rarr; {tempEnd || 'Present'}
            </span>
            {dayDiff > 0 && (
              <span className="text-[10px] text-emerald-400/80 mt-0.5 block">
                ({dayDiff} {dayDiff === 1 ? 'day' : 'days'} included in range)
              </span>
            )}
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4 gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Clear Date Filter
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-emerald-400 transition-all active:scale-95"
          >
            <Check className="h-4 w-4" />
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDateModal;
