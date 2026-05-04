import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

const TOAST_STYLES = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-500/10 border-green-500/30',
    icon_color: 'text-green-400',
    title_color: 'text-green-300',
    bar: 'bg-green-500'
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-500/10 border-red-500/30',
    icon_color: 'text-red-400',
    title_color: 'text-red-300',
    bar: 'bg-red-500'
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    icon_color: 'text-yellow-400',
    title_color: 'text-yellow-300',
    bar: 'bg-yellow-500'
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10 border-blue-500/30',
    icon_color: 'text-blue-400',
    title_color: 'text-blue-300',
    bar: 'bg-blue-500'
  },
  loading: {
    icon: Loader2,
    bg: 'bg-primary-500/10 border-primary-500/30',
    icon_color: 'text-primary-400 animate-spin',
    title_color: 'text-primary-300',
    bar: 'bg-primary-500'
  }
};

const ToastItem = ({ toast, onRemove }) => {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      className={`
        relative flex items-start gap-3 px-4 py-3 rounded-xl border 
        ${style.bg} backdrop-blur-xl shadow-xl
        animate-slide-down min-w-[280px] max-w-[380px]
        transition-all duration-300
      `}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.icon_color}`} />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${style.title_color}`}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden">
          <div
            className={`h-full ${style.bar} origin-left`}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

const Toast = ({ toasts, removeToast }) => {
  if (!toasts.length) return null;

  return (
    <>
      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </>
  );
};

export default Toast;