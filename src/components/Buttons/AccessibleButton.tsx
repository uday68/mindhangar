import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';
import { LoadingSpinner } from '../Loading/LoadingSpinner';

export interface AccessibleButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
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
        bg-teal-500 text-white border-teal-500
        hover:bg-teal-600 hover:border-teal-600
        focus:ring-teal-200
        disabled:bg-teal-300 disabled:border-teal-300
      `,
      secondary: `
        bg-white text-teal-600 border-teal-500
        hover:bg-teal-50
        focus:ring-teal-200
        disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300
      `,
      ghost: `
        bg-transparent text-gray-700 border-transparent
        hover:bg-gray-100
        focus:ring-gray-200
        disabled:text-gray-400
      `,
      danger: `
        bg-red-500 text-white border-red-500
        hover:bg-red-600 hover:border-red-600
        focus:ring-red-200
        disabled:bg-red-300 disabled:border-red-300
      `,
    };

    // Size classes (ensuring minimum 44x44px touch target)
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm min-h-[44px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[48px]',
    };

    // Animation variants
    const buttonVariants = {
      idle: { scale: 1 },
      hover: {
        scale: shouldAnimate ? 1.02 : 1,
        transition: {
          duration: shouldAnimate ? config.duration.fast / 1000 : 0,
        },
      },
      tap: {
        scale: shouldAnimate ? 0.98 : 1,
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
          inline-flex items-center justify-center gap-2
          font-medium rounded-lg border-2 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${className}
        `}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        variants={buttonVariants}
        initial="idle"
        whileHover={!isDisabled ? 'hover' : 'idle'}
        whileTap={!isDisabled ? 'tap' : 'idle'}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <LoadingSpinner
            size="sm"
            color={variant === 'secondary' || variant === 'ghost' ? 'primary' : 'white'}
          />
        )}

        {/* Left Icon */}
        {!loading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}

        {/* Button Text */}
        <span>{children}</span>

        {/* Right Icon */}
        {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </motion.button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
