import React from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

const UploadProgress = ({ progress, status, fileName }) => {
  if (progress === 0 && status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: Upload,
          color: 'text-primary-400',
          barColor: 'from-primary-500 to-accent-500',
          text: `Uploading ${fileName || 'file'}...`,
          animate: true
        };
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          barColor: 'from-green-500 to-emerald-500',
          text: 'Upload complete!',
          animate: false
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          barColor: 'from-red-500 to-rose-500',
          text: 'Upload failed',
          animate: false
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="glass-card border border-white/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color} ${config.animate ? 'animate-bounce-soft' : ''}`} />
          <span className="text-sm font-medium text-white/80">{config.text}</span>
        </div>
        <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${config.barColor} rounded-full transition-all duration-300`}
          style={{ width: `${Math.max(2, progress)}%` }}
        />
      </div>

      {/* Animated dots for uploading state */}
      {status === 'uploading' && (
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary-400"
              style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadProgress;