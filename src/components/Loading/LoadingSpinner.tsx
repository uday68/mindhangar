/**
 * Loading Spinner Component
 * Displays a spinning loader for operations taking 500ms-3s
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Loading',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    primary: 'border-teal-500 border-t-transparent',
    secondary: 'border-gray-500 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div
      className="inline-flex items-center justify-center"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`}
      />
      <span className="sr-only">{label}...</span>
    </div>
  );
};

export const LoadingOverlay: React.FC<{
  message?: string;
  transparent?: boolean;
}> = ({ message = 'Loading', transparent = false }) => (
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center ${
      transparent ? 'bg-black/20' : 'bg-white/90'
    } backdrop-blur-sm`}
    role="status"
    aria-busy="true"
    aria-label={message}
  >
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="xl" />
      {message && (
        <p className="text-lg font-medium text-gray-700">{message}</p>
      )}
    </div>
  </div>
);

export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}> = ({ loading, children, onClick, disabled, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
      disabled || loading
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-teal-500 text-white hover:bg-teal-600'
    } ${className}`}
    aria-busy={loading}
  >
    {loading && (
      <LoadingSpinner size="sm" color="white" className="absolute left-4" />
    )}
    <span className={loading ? 'opacity-0' : ''}>{children}</span>
  </button>
);
