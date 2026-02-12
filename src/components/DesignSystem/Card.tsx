import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
  padding?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  loading = false,
  header,
  footer,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-250 ease-in-out';
  
  const variantStyles = {
    default: 'bg-white border border-[var(--color-neutral-200)]',
    elevated: 'bg-white shadow-md hover:shadow-lg',
    outlined: 'bg-transparent border-2 border-[var(--color-neutral-300)]',
    interactive: 'bg-white border border-[var(--color-neutral-200)] hover:shadow-md hover:-translate-y-1 cursor-pointer'
  };
  
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  if (loading) {
    return (
      <div className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[var(--color-neutral-200)] rounded w-3/4"></div>
          <div className="h-4 bg-[var(--color-neutral-200)] rounded w-1/2"></div>
          <div className="h-4 bg-[var(--color-neutral-200)] rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {header && (
        <div className={`${paddingStyles[padding]} border-b border-[var(--color-neutral-200)]`}>
          {header}
        </div>
      )}
      
      <div className={paddingStyles[padding]}>
        {children}
      </div>
      
      {footer && (
        <div className={`${paddingStyles[padding]} border-t border-[var(--color-neutral-200)]`}>
          {footer}
        </div>
      )}
    </div>
  );
};
