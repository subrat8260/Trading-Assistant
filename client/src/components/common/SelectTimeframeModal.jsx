import { Clock, X, Check } from 'lucide-react';

export const TIMEFRAME_OPTIONS = [
  { value: '00:05', label: '5 Sec' },
  { value: '00:10', label: '10 Sec' },
  { value: '00:15', label: '15 Sec' },
  { value: '00:30', label: '30 Sec' },
  { value: '01:00', label: '1 Min' },
  { value: '02:00', label: '2 Min' },
  { value: '05:00', label: '5 Min' },
  { value: '10:00', label: '10 Min' },
  { value: '30:00', label: '30 Min' },
  { value: '59:00', label: '59 Min' },
];

const SelectTimeframeModal = ({ isOpen, onClose, selectedTimeframe, onSelectTimeframe }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Select Timeframe</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 3-Column Timeframe Grid matching reference image */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          {TIMEFRAME_OPTIONS.map((tf) => {
            const isSelected = selectedTimeframe === tf.value;
            return (
              <button
                key={tf.value}
                onClick={() => {
                  onSelectTimeframe(tf.value);
                  onClose();
                }}
                className={`relative flex flex-col items-center justify-center rounded-xl p-3.5 transition-all border font-mono ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-105 font-extrabold'
                    : 'bg-slate-900/90 border-slate-800/90 text-slate-200 hover:bg-slate-800 hover:border-slate-700 hover:text-white font-semibold'
                }`}
              >
                <span className="text-base tracking-tight">{tf.value}</span>
                <span
                  className={`text-[10px] font-sans font-medium mt-0.5 ${
                    isSelected ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {tf.label}
                </span>

                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-400 text-slate-950">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectTimeframeModal;
