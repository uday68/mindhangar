import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'outline' | 'flat';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  hoverable = false,
  padding = 'md',
  ...props 
}) => {
  const variants = {
    default: "bg-white border border-gray-100 shadow-sm",
    glass: "bg-white/60 backdrop-blur-md border border-white/50 shadow-sm",
    outline: "bg-transparent border border-gray-200",
    flat: "bg-gray-50 border-transparent"
  };

  const paddings = {
    none: "",
    sm: "p-2",
    md: "p-4",
    lg: "p-6"
  };

  const hoverStyles = hoverable 
    ? "hover:border-teal-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" 
    : "";

  return (
    <div 
      className={`rounded-xl transition-all duration-200 overflow-hidden ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};
