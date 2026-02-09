import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';
import { Icons } from '../../../components/Icons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AccessibleSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      required = false,
      size = 'md',
      placeholder,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const { shouldAnimate, config } = useAnimation();
    const [isFocused, setIsFocused] = useState(false);
    const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    // Animation variants
    const errorVariants = {
      hidden: { opacity: 0, y: -10, height: 0 },
      visible: {
        opacity: 1,
        y: 0,
        height: 'auto' as const,
        transition: {
          duration: shouldAnimate ? config.duration.fast / 1000 : 0,
        },
      },
    };

    const labelVariants = {
      default: { y: 0, scale: 1 },
      focused: {
        y: shouldAnimate ? -2 : 0,
        scale: shouldAnimate ? 0.95 : 1,
        transition: {
          duration: shouldAnimate ? config.duration.fast / 1000 : 0,
        },
      },
    };

    const chevronVariants = {
      default: { rotate: 0 },
      focused: {
        rotate: shouldAnimate ? 180 : 0,
        transition: {
          duration: shouldAnimate ? config.duration.fast / 1000 : 0,
        },
      },
    };

    return (
      <div className={`w-full ${className}`}>
        {/* Label */}
        <motion.label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
          variants={labelVariants}
          animate={isFocused ? 'focused' : 'default'}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </motion.label>

        {/* Select Container */}
        <div className="relative">
          {/* Select */}
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full rounded-lg border transition-all duration-200 appearance-none
              ${sizeClasses[size]}
              pr-10
              ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
              }
              ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white cursor-pointer'}
              focus:outline-none
            `}
            aria-invalid={!!error}
            aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
            aria-required={required}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
            variants={chevronVariants}
            animate={isFocused ? 'focused' : 'default'}
          >
            <Icons.ChevronDown size={20} />
          </motion.div>

          {/* Focus Ring Indicator */}
          {isFocused && !error && (
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-teal-500 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldAnimate ? 0.15 : 0 }}
            />
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              id={errorId}
              className="flex items-center gap-1 text-red-600 text-sm mt-1"
              role="alert"
              aria-live="polite"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Icons.AlertCircle size={14} aria-hidden="true" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helper Text */}
        {helperText && !error && (
          <p id={helperId} className="text-gray-500 text-sm mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AccessibleSelect.displayName = 'AccessibleSelect';
