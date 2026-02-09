/**
 * Error State Component
 * Displays user-friendly error messages with recovery options
 */

import React from 'react';
import { Icons } from '../../../components/Icons';

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'modal' | 'toast';
  severity?: 'error' | 'warning' | 'info';
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onDismiss,
  variant = 'inline',
  severity = 'error',
  className = '',
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  const severityStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const severityIcons = {
    error: <Icons.X size={20} className="text-red-600" />,
    warning: <Icons.AlertTriangle size={20} className="text-yellow-600" />,
    info: <Icons.Info size={20} className="text-blue-600" />,
  };

  if (variant === 'toast') {
    return (
      <div
        className={`fixed top-20 right-4 z-50 max-w-md p-4 rounded-lg border shadow-lg ${severityStyles[severity]} ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          {severityIcons[severity]}
          <div className="flex-1">
            <p className="font-medium">{errorMessage}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-black/10 rounded transition-colors"
              aria-label="Dismiss error"
            >
              <Icons.X size={16} />
            </button>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 px-4 py-2 bg-white rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-title"
      >
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
          <div className="flex items-start gap-3 mb-4">
            {severityIcons[severity]}
            <div className="flex-1">
              <h2 id="error-title" className="text-lg font-bold text-gray-900">
                {severity === 'error' ? 'Error' : severity === 'warning' ? 'Warning' : 'Information'}
              </h2>
              <p className="mt-2 text-gray-700">{errorMessage}</p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            )}
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div
      className={`p-4 rounded-lg border ${severityStyles[severity]} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {severityIcons[severity]}
        <div className="flex-1">
          <p className="font-medium">{errorMessage}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-white rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              <Icons.RotateCcw size={16} />
              Try Again
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            aria-label="Dismiss error"
          >
            <Icons.X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}> = ({ icon, title, description, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
    {icon && <div className="mb-4 text-gray-400">{icon}</div>}
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    {description && <p className="text-gray-600 mb-4 max-w-md">{description}</p>}
    {action && (
      <button
        onClick={action.onClick}
        className="px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);

export const OfflineState: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => (
  <EmptyState
    icon={<Icons.WifiOff size={48} />}
    title="You're Offline"
    description="Check your internet connection and try again. Some features may be limited while offline."
    action={onRetry ? { label: 'Retry Connection', onClick: onRetry } : undefined}
  />
);
