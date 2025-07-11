import React, { useEffect, useState } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 4000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 200);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check size={20} className="text-success-400" />;
      case 'error':
        return <X size={20} className="text-error-400" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-warning-400" />;
      case 'info':
      default:
        return <Info size={20} className="text-primary-400" />;
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      case 'info':
      default:
        return 'border-primary-600 bg-primary-600/10';
    }
  };

  return (
    <div
      className={`toast ${getTypeClasses()} transition-all duration-200 ${
        isVisible && !isLeaving
          ? 'opacity-100 translate-x-0'
          : isLeaving
          ? 'opacity-0 translate-x-full'
          : 'opacity-0 translate-x-full'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-label-large text-surface-300 font-medium">
            {title}
          </h4>
          {message && (
            <p className="text-body-small text-surface-400 mt-1">
              {message}
            </p>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-surface-300 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;