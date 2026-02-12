import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  helperText,
  prefixIcon,
  suffixIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'px-4 py-3 rounded-lg border-2 transition-all duration-250 ease-in-out focus:outline-none';
  
  const stateStyles = error
    ? 'border-[var(--color-error-main)] focus:border-[var(--color-error-dark)] focus:ring-2 focus:ring-[var(--color-error-light)]'
    : success
    ? 'border-[var(--color-success-main)] focus:border-[var(--color-success-dark)] focus:ring-2 focus:ring-[var(--color-success-light)]'
    : 'border-[var(--color-neutral-300)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)]';
  
  const disabledStyles = disabled
    ? 'bg-[var(--color-neutral-100)] cursor-not-allowed opacity-60'
    : 'bg-white';
  
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthStyle}`}>
      {label && (
        <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-500)]">
            {prefixIcon}
          </div>
        )}
        
        <input
          className={`${baseStyles} ${stateStyles} ${disabledStyles} ${widthStyle} ${className} ${
            prefixIcon ? 'pl-10' : ''
          } ${suffixIcon ? 'pr-10' : ''}`}
          disabled={disabled}
          {...props}
        />
        
        {suffixIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-500)]">
            {suffixIcon}
          </div>
        )}
      </div>
      
      {(error || success || helperText) && (
        <p className={`text-sm mt-2 ${
          error
            ? 'text-[var(--color-error-main)]'
            : success
            ? 'text-[var(--color-success-main)]'
            : 'text-[var(--color-neutral-600)]'
        }`}>
          {error || success || helperText}
        </p>
      )}
    </div>
  );
};
