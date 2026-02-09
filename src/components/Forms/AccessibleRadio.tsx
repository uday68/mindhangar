import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';
import { Icons } from '../../../components/Icons';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface AccessibleRadioProps {
  name: string;
  label: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  required?: boolean;
}

export const AccessibleRadio = forwardRef<HTMLDivElement, AccessibleRadioProps>(
  (
    {
      name,
      label,
      options,
      value,
      onChange,
      error,
      size = 'md',
      orientation = 'vertical',
      className = '',
      required = false,
    },
    ref
  ) => {
    const { shouldAnimate, config } = useAnimation();
    const groupId = `radio-group-${name}`;
    const errorId = `${groupId}-error`;

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
    const dotVariants = {
      unchecked: { scale: 0, opacity: 0 },
      checked: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: shouldAnimate ? config.duration.fast / 1000 : 0,
        },
      },
    };

    const circleVariants = {
      idle: { scale: 1 },
      hover: { scale: shouldAnimate ? 1.05 : 1 },
      tap: { scale: shouldAnimate ? 0.95 : 1 },
    };

    return (
      <div ref={ref} className={`w-full ${className}`}>
        {/* Group Label */}
        <div className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </div>

        {/* Radio Group */}
        <div
          role="radiogroup"
          aria-labelledby={groupId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            flex gap-4
            ${orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'}
          `}
        >
          {options.map((option) => {
            const isChecked = value === option.value;
            const optionId = `${name}-${option.value}`;

            return (
              <div key={option.value} className="flex items-start">
                <div className="flex items-center h-5">
                  {/* Hidden Native Radio */}
                  <input
                    type="radio"
                    id={optionId}
                    name={name}
                    value={option.value}
                    checked={isChecked}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={option.disabled}
                    className="sr-only"
                    aria-describedby={option.description ? `${optionId}-description` : undefined}
                  />

                  {/* Custom Radio */}
                  <motion.label
                    htmlFor={optionId}
                    className={`
                      ${sizeClasses[size]}
                      flex items-center justify-center
                      rounded-full border-2 transition-colors cursor-pointer
                      ${
                        error
                          ? 'border-red-500'
                          : isChecked
                          ? 'border-teal-500 bg-white'
                          : 'border-gray-300 bg-white hover:border-teal-400'
                      }
                      ${option.disabled ? 'opacity-60 cursor-not-allowed' : ''}
                      focus-within:ring-2 focus-within:ring-teal-200 focus-within:ring-offset-2
                    `}
                    variants={circleVariants}
                    initial="idle"
                    whileHover={!option.disabled ? 'hover' : 'idle'}
                    whileTap={!option.disabled ? 'tap' : 'idle'}
                  >
                    {/* Radio Dot */}
                    <motion.div
                      className={`
                        rounded-full bg-teal-500
                        ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'}
                      `}
                      variants={dotVariants}
                      initial="unchecked"
                      animate={isChecked ? 'checked' : 'unchecked'}
                    />
                  </motion.label>
                </div>

                {/* Label and Description */}
                <div className="ml-3 flex-1">
                  <label
                    htmlFor={optionId}
                    className={`
                      font-medium cursor-pointer
                      ${labelSizeClasses[size]}
                      ${error ? 'text-red-700' : 'text-gray-900'}
                      ${option.disabled ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                  >
                    {option.label}
                  </label>

                  {option.description && (
                    <p id={`${optionId}-description`} className="text-gray-500 text-sm mt-0.5">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            id={errorId}
            className="flex items-center gap-1 text-red-600 text-sm mt-2"
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
    );
  }
);

AccessibleRadio.displayName = 'AccessibleRadio';
