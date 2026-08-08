import { Shield, Activity, Flame, X, Check, AlertCircle } from 'lucide-react';

export const RISK_TOLERANCE_OPTIONS = [
  {
    id: 'conservative',
    title: 'Conservative',
    subtitle: 'Low Risk & Capital Preservation',
    desc: 'Strict risk parameters focusing on capital protection and smaller stake sizing.',
    icon: Shield,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    activeBg: 'bg-sky-600',
  },
  {
    id: 'moderate',
    title: 'Moderate',
    subtitle: 'Balanced Growth & Risk (Recommended)',
    desc: 'Optimal balance between capital growth and controlled drawdown risk.',
    icon: Activity,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    activeBg: 'bg-amber-600',
  },
  {
    id: 'aggressive',
    title: 'Aggressive',
    subtitle: 'High Risk & Compound Acceleration',
    desc: 'Higher stake scaling aimed at accelerating compounding during winning streaks.',
    icon: Flame,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    activeBg: 'bg-rose-600',
  },
];

const SelectRiskToleranceModal = ({ isOpen, onClose, selectedRisk, onSelectRisk }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-md max-h-[85vh] rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Select Risk Tolerance</h2>
              <p className="text-xs text-slate-400">Configure money management risk profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar min-h-0">
          {RISK_TOLERANCE_OPTIONS.map((item) => {
            const isSelected = selectedRisk === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectRisk(item.id);
                  onClose();
                }}
                className={`flex w-full items-start justify-between rounded-xl p-3.5 text-left transition-all border ${
                  isSelected
                    ? `${item.activeBg} border-white/40 text-white shadow-xl scale-[1.01]`
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isSelected ? 'bg-black/20 text-white' : `${item.bgColor} ${item.color} border ${item.borderColor}`
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{item.title}</span>
                    </div>
                    <div className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-white/90' : item.color}`}>
                      {item.subtitle}
                    </div>
                    <p className={`text-[11px] mt-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>

                {isSelected && <Check className="h-5 w-5 text-white shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectRiskToleranceModal;
