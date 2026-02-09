import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  icon: React.ReactNode;
  ariaLabel: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      ariaLabel,
      variant = 'ghost',
      size = 'md',
      loading = false,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const { shouldAnimate, config } = useAnimation();
    const isDisabled = disabled || loading;

    // Variant classes
    const variantClasses = {
      primary: `
        bg-teal-500 text-white
        hover:bg-teal-600
        focus:ring-teal-200
        disabled:bg-teal-300
      `,
      secondary: `
        bg-white text-teal-600 border border-teal-500
        hover:bg-teal-50
        focus:ring-teal-200
        disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300
      `,
      ghost: `
        bg-transparent text-gray-700
        hover:bg-gray-100
        focus:ring-gray-200
        disabled:text-gray-400
      `,
      danger: `
        bg-red-500 text-white
        hover:bg-red-600
        focus:ring-red-200
        disabled:bg-red-300
      `,
    };

    // Size classes (ensuring minimum 44x44px touch target)
    const sizeClasses = {
      sm: 'p-2 min-w-[44px] min-h-[44px]',
      md: 'p-3 min-w-[44px] min-h-[44px]',
      lg: 'p-4 min-w-[48px] min-h-[48px]',
    };

    // Animation variants
    const buttonVariants = {
      idle: { scale: 1, rotate: 0 },
      hover: {
        scale: shouldAnimate ? 1.1 : 1,
        transition: {
          duration: shouldAnimate ? config.duration.fast / 1000 : 0,
        },
      },
      tap: {
        scale: shouldAnimate ? 0.9 : 1,
        transition: {
          duration: shouldAnimate ? config.duration.fast / 1000 : 0,
        },
      },
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        className={`
          inline-flex items-center justify-center
          rounded-lg transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${className}
        `}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-busy={loading}
        aria-disabled={isDisabled}
        title={ariaLabel}
        variants={buttonVariants}
        initial="idle"
        whileHover={!isDisabled ? 'hover' : 'idle'}
        whileTap={!isDisabled ? 'tap' : 'idle'}
        {...props}
      >
        {loading ? (
          <div className="animate-spin" aria-hidden="true">
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : (
          <span aria-hidden="true">{icon}</span>
        )}
      </motion.button>
    );
  }
);

IconButton.displayName = 'IconButton';
