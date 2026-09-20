import React from 'react';
import { useUI } from '../../context/UIContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useUI();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      id="global-toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info';

        const Icon = isSuccess
          ? CheckCircle2
          : isError
          ? AlertCircle
          : isWarning
          ? AlertTriangle
          : Info;

        const borderBgStyle = isSuccess
          ? 'bg-neutral-900/95 border-emerald-500/40 text-emerald-400'
          : isError
          ? 'bg-neutral-900/95 border-rose-500/40 text-rose-400'
          : isWarning
          ? 'bg-neutral-900/95 border-amber-500/40 text-amber-400'
          : 'bg-neutral-900/95 border-indigo-500/40 text-indigo-400';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${borderBgStyle}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-neutral-100 leading-tight">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-500 hover:text-neutral-300 transition p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
