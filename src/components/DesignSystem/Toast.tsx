import React, { useEffect } from 'react';
import { Icons } from '../../components/Icons';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose,
  action
}) => {
  const icons = {
    success: <Icons.CheckCircle size={20} />,
    error: <Icons.XCircle size={20} />,
    warning: <Icons.AlertTriangle size={20} />,
    info: <Icons.Info size={20} />
  };

  const styles = {
    success: 'bg-[var(--color-success-light)] border-[var(--color-success-main)] text-[var(--color-success-dark)]',
    error: 'bg-[var(--color-error-light)] border-[var(--color-error-main)] text-[var(--color-error-dark)]',
    warning: 'bg-[var(--color-warning-light)] border-[var(--color-warning-main)] text-[var(--color-warning-dark)]',
    info: 'bg-[var(--color-info-light)] border-[var(--color-info-main)] text-[var(--color-info-dark)]'
  };

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border-l-4 shadow-lg animate-slideInRight ${styles[type]}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      
      <p className="flex-1 text-sm font-medium">
        {message}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-semibold underline hover:no-underline"
        >
          {action.label}
        </button>
      )}
      
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Close notification"
      >
        <Icons.X size={16} />
      </button>
    </div>
  );
};

// Toast Container Component
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right'
}) => {
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  return (
    <div className={`fixed ${positionStyles[position]} z-50 flex flex-col gap-3 max-w-md w-full`}>
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};
