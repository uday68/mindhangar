/**
 * Skeleton Loader Component
 * Displays placeholder content while data is loading
 */

import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'avatar' | 'image' | 'custom';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
  animate?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  animate = true,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'card':
        return 'h-32 rounded-xl';
      case 'avatar':
        return 'w-10 h-10 rounded-full';
      case 'image':
        return 'h-48 rounded-lg';
      case 'custom':
        return '';
      default:
        return 'h-4 rounded';
    }
  };

  const baseStyles = 'bg-gray-200';
  const animationStyles = animate ? 'animate-pulse' : '';
  const variantStyles = getVariantStyles();

  const style: React.CSSProperties = {
    width: width || (variant === 'avatar' ? '2.5rem' : '100%'),
    height: height || undefined,
  };

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`${baseStyles} ${variantStyles} ${animationStyles} ${className}`}
      style={style}
      role="status"
      aria-busy="true"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  ));

  return count > 1 ? (
    <div className="space-y-3">{skeletons}</div>
  ) : (
    <>{skeletons}</>
  );
};

// Preset skeleton layouts
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`p-4 border border-gray-200 rounded-xl ${className}`}>
    <div className="flex items-center gap-3 mb-3">
      <SkeletonLoader variant="avatar" />
      <div className="flex-1">
        <SkeletonLoader variant="text" width="60%" className="mb-2" />
        <SkeletonLoader variant="text" width="40%" height="0.75rem" />
      </div>
    </div>
    <SkeletonLoader variant="text" count={3} className="mb-2" />
    <SkeletonLoader variant="image" height="12rem" />
  </div>
);

export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({ 
  count = 5, 
  className 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
        <SkeletonLoader variant="avatar" />
        <div className="flex-1">
          <SkeletonLoader variant="text" width="70%" className="mb-2" />
          <SkeletonLoader variant="text" width="50%" height="0.75rem" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonPanel: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`p-6 ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <SkeletonLoader variant="text" width="30%" height="1.5rem" />
      <SkeletonLoader variant="custom" width="6rem" height="2rem" className="rounded-lg" />
    </div>
    <SkeletonLoader variant="text" count={2} className="mb-4" />
    <SkeletonLoader variant="card" className="mb-4" />
    <SkeletonLoader variant="text" count={3} />
  </div>
);
