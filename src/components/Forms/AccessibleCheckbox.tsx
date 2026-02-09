import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';
import { Icons } from '../../../components/Icons';

export interface AccessibleCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AccessibleCheckbox = forwardRef<HTMLInputElement, AccessibleCheckboxProps>(
  ({ label, description, error, size = 'md', className = '', id, disabled, checked, ...props }, ref) => {
    const { shouldAnimate, config } = useAnimation();
    const checkboxId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = `${checkboxId}-error`;
    const descriptionId = `${checkboxId}-description`;

    // Size classes
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const labelSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    // Animation variants
    const checkVariants = {
      unchecked: { scale: 0, opacity: 0 },
      checked: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: shouldAnimate ? config.duration.fast / 1000 : 0,
        },
      },
    };

    const boxVariants = {
      idle: { scale: 1 },
      hover: { scale: shouldAnimate ? 1.05 : 1 },
      tap: { scale: shouldAnimate ? 0.95 : 1 },
    };

    return (
      <div className={`flex items-start ${className}`}>
        <div className="flex items-center h-5">
          {/* Hidden Native Checkbox */}
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="sr-only"
            aria-invalid={!!error}
            aria-describedby={`${error ? errorId : ''} ${description ? descriptionId : ''}`.trim()}
            disabled={disabled}
            checked={checked}
            {...props}
          />

          {/* Custom Checkbox */}
          <motion.label
            htmlFor={checkboxId}
            className={`
              ${sizeClasses[size]}
              flex items-center justify-center
              rounded border-2 transition-colors cursor-pointer
              ${
                error
                  ? 'border-red-500'
                  : checked
                  ? 'border-teal-500 bg-teal-500'
                  : 'border-gray-300 bg-white hover:border-teal-400'
              }
              ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
              focus-within:ring-2 focus-within:ring-teal-200 focus-within:ring-offset-2
            `}
            variants={boxVariants}
            initial="idle"
            whileHover={!disabled ? 'hover' : 'idle'}
            whileTap={!disabled ? 'tap' : 'idle'}
          >
            {/* Check Icon */}
            <motion.div
              variants={checkVariants}
              initial="unchecked"
              animate={checked ? 'checked' : 'unchecked'}
            >
              <Icons.Check size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} className="text-white" />
            </motion.div>
          </motion.label>
        </div>

        {/* Label and Description */}
        <div className="ml-3 flex-1">
          <label
            htmlFor={checkboxId}
            className={`
              font-medium cursor-pointer
              ${labelSizeClasses[size]}
              ${error ? 'text-red-700' : 'text-gray-900'}
              ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            {label}
          </label>

          {description && (
            <p id={descriptionId} className="text-gray-500 text-sm mt-0.5">
              {description}
            </p>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              id={errorId}
              className="flex items-center gap-1 text-red-600 text-sm mt-1"
              role="alert"
              aria-live="polite"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldAnimate ? config.duration.fast / 1000 : 0 }}
            >
              <Icons.AlertCircle size={14} aria-hidden="true" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>
      </div>
    );
  }
);

AccessibleCheckbox.displayName = 'AccessibleCheckbox';
