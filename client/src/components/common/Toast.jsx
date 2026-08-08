import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeStyles = {
    success: 'border-emerald-500/30 bg-emerald-950/90 text-emerald-300 shadow-emerald-500/10',
    error: 'border-rose-500/30 bg-rose-950/90 text-rose-300 shadow-rose-500/10',
    info: 'border-indigo-500/30 bg-indigo-950/90 text-indigo-300 shadow-indigo-500/10',
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />,
    info: <Info className="h-5 w-5 text-indigo-400 shrink-0" />,
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl max-w-md text-sm font-medium ${typeStyles[type] || typeStyles.success}`}>
        {icons[type] || icons.success}
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 rounded-md p-1 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
