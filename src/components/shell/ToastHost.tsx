import React from 'react';
import { X } from 'lucide-react';
import { useJarvis } from '../../store/jarvisStore';

const TONE_BORDER: Record<'cyan' | 'emerald' | 'amber' | 'rose', string> = {
  cyan: 'border-[#14F1D9]/50 text-[#14F1D9]',
  emerald: 'border-emerald-400/50 text-emerald-400',
  amber: 'border-amber-400/50 text-amber-400',
  rose: 'border-rose-400/50 text-rose-400',
};

export const ToastHost: React.FC = () => {
  const { toasts, dismissToast } = useJarvis();
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="no-print fixed bottom-5 right-5 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-xl border bg-[#0B0E14] px-4 py-2.5 text-xs font-medium shadow-xl transition-transform duration-150 ${TONE_BORDER[toast.tone]}`}
        >
          <span className="text-slate-100">{toast.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
