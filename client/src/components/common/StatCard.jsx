import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, change, isPositive, icon: Icon }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700 overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 truncate">
          {title}
        </span>
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <h3 className="text-xl font-bold text-white tracking-tight truncate">{value}</h3>
        {change && (
          <div className="mt-1 flex items-center gap-1 text-xs truncate">
            <span
              className={`inline-flex items-center gap-1 font-medium truncate ${isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3 shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 shrink-0" />
              )}
              <span className="truncate">{change}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
