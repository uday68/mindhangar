import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';
import { Icons } from '../../../components/Icons';

export interface AccessibleInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      size = 'md',
      leftIcon,
      rightIcon,
      onClear,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const { shouldAnimate, config } = useAnimation();
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

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

    return (
      <div className={`w-full ${className}`}>
        {/* Label */}
        <motion.label
          htmlFor={inputId}
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

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-lg border transition-all duration-200
              ${sizeClasses[size]}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || onClear ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
              }
              ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
              focus:outline-none
            `}
            aria-invalid={!!error}
            aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
            aria-required={required}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Right Icon or Clear Button */}
          {(rightIcon || (onClear && props.value)) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {onClear && props.value ? (
                <motion.button
                  type="button"
                  onClick={onClear}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-1"
                  aria-label="Clear input"
                  whileHover={{ scale: shouldAnimate ? 1.1 : 1 }}
                  whileTap={{ scale: shouldAnimate ? 0.9 : 1 }}
                >
                  <Icons.X size={16} />
                </motion.button>
              ) : (
                <div className="text-gray-400" aria-hidden="true">
                  {rightIcon}
                </div>
              )}
            </div>
          )}

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

AccessibleInput.displayName = 'AccessibleInput';
