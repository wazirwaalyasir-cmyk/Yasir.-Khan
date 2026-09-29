import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700/50'
              : toast.type === 'error'
              ? 'bg-rose-900/90 text-white border-rose-700/50'
              : 'bg-purple-950/90 text-white border-purple-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-purple-300 shrink-0" />}
            <span className="text-sm font-medium leading-relaxed font-pashto">{toast.text}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"
            aria-label="بندول"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>
        </div>
      ))}
    </div>
  );
};
