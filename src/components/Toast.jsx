import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-green-400" />,
    error: <XCircle size={20} className="text-red-400" />,
    warning: <AlertCircle size={20} className="text-yellow-400" />,
    info: <Info size={20} className="text-blue-400" />
  };

  const bgColors = {
    success: 'bg-green-500/20 border-green-500/50',
    error: 'bg-red-500/20 border-red-500/50',
    warning: 'bg-yellow-500/20 border-yellow-500/50',
    info: 'bg-blue-500/20 border-blue-500/50'
  };

  return (
    <div className={`fixed top-6 right-6 z-[100] max-w-md animate-in slide-in-from-top-5 fade-in duration-300`}>
      <div className={`${bgColors[type]} backdrop-blur-sm border rounded-xl p-4 shadow-2xl flex items-start gap-3`}>
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1 text-white">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default Toast;
