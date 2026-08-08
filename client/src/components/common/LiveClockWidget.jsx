import { useState, useEffect } from 'react';
import { Clock, Globe, ChevronDown, X, Check } from 'lucide-react';

export const TIMEZONE_OPTIONS = [
  { id: 'LOCAL', label: 'Local Browser Time', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { id: 'UTC', label: 'UTC (Coordinated Universal Time)', timeZone: 'UTC' },
  { id: 'Asia/Kolkata', label: 'IST - India (UTC+05:30)', timeZone: 'Asia/Kolkata' },
  { id: 'America/New_York', label: 'EST/EDT - New York (UTC-05:00)', timeZone: 'America/New_York' },
  { id: 'Europe/London', label: 'GMT/BST - London (UTC+00:00)', timeZone: 'Europe/London' },
  { id: 'Europe/Berlin', label: 'CET/CEST - Berlin / Frankfurt (UTC+01:00)', timeZone: 'Europe/Berlin' },
  { id: 'Asia/Tokyo', label: 'JST - Tokyo (UTC+09:00)', timeZone: 'Asia/Tokyo' },
  { id: 'Asia/Riyadh', label: 'AST - Riyadh / Saudi (UTC+03:00)', timeZone: 'Asia/Riyadh' },
  { id: 'Asia/Dubai', label: 'GST - Dubai / UAE (UTC+04:00)', timeZone: 'Asia/Dubai' },
  { id: 'Asia/Singapore', label: 'SGT - Singapore (UTC+08:00)', timeZone: 'Asia/Singapore' },
  { id: 'America/Los_Angeles', label: 'PST/PDT - Los Angeles (UTC-08:00)', timeZone: 'America/Los_Angeles' },
  { id: 'America/Chicago', label: 'CST/CDT - Chicago (UTC-06:00)', timeZone: 'America/Chicago' },
  { id: 'Australia/Sydney', label: 'AEST - Sydney (UTC+10:00)', timeZone: 'Australia/Sydney' },
];

const LiveClockWidget = () => {
  // Load saved timezone preference or default to Local Browser Time
  const [selectedTzId, setSelectedTzId] = useState(() => {
    return localStorage.getItem('trading_timezone_pref') || 'LOCAL';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');

  const activeTzObj = TIMEZONE_OPTIONS.find((t) => t.id === selectedTzId) || TIMEZONE_OPTIONS[0];

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      try {
        const formattedTime = now.toLocaleTimeString('en-US', {
          timeZone: activeTzObj.timeZone,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const formattedDate = now.toLocaleDateString('en-US', {
          timeZone: activeTzObj.timeZone,
          month: 'short',
          day: 'numeric',
        });

        setTimeString(formattedTime);
        setDateString(formattedDate);
      } catch (err) {
        setTimeString(now.toLocaleTimeString());
        setDateString(now.toLocaleDateString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeTzObj]);

  const handleSelectTimezone = (tzId) => {
    setSelectedTzId(tzId);
    localStorage.setItem('trading_timezone_pref', tzId);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Live Clock Button Trigger */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-sm"
        title="Click to change timezone"
      >
        <Clock className="h-4 w-4 text-emerald-400 animate-pulse shrink-0" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-extrabold tracking-widest text-white drop-shadow-sm">
            {timeString || '--:--:--'}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/80">
            {activeTzObj.id === 'LOCAL' ? 'LOCAL' : activeTzObj.id.split('/')[1] || activeTzObj.id}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
      </button>

      {/* Timezone Select Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative flex flex-col w-full max-w-md max-h-[85vh] rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4 overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Select Timezone</h3>
                  <p className="text-xs text-slate-400">Live clock updates according to your selection</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Timezone List */}
            <div className="space-y-1.5 pt-1">
              {TIMEZONE_OPTIONS.map((option) => {
                const isSelected = selectedTzId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectTimezone(option.id)}
                    className={`flex w-full items-center justify-between rounded-xl p-3 text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-indigo-600/90 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                      <span className="text-left">{option.label}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveClockWidget;
