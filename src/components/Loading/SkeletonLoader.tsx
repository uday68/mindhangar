import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = ''
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'card':
        return 'rounded-xl';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getDefaultSize = () => {
    switch (variant) {
      case 'circular':
        return { width: '40px', height: '40px' };
      case 'card':
        return { width: '100%', height: '200px' };
      case 'rectangular':
        return { width: '100%', height: '100px' };
      case 'text':
      default:
        return { width: '100%', height: '16px' };
    }
  };

  const defaultSize = getDefaultSize();
  const style = {
    width: width || defaultSize.width,
    height: height || defaultSize.height
  };

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`bg-gray-200 animate-pulse ${getVariantClasses()} ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  ));

  return count > 1 ? (
    <div className="space-y-2">{skeletons}</div>
  ) : (
    <>{skeletons}</>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <SkeletonLoader variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <SkeletonLoader variant="text" width="60%" height={16} />
        <SkeletonLoader variant="text" width="40%" height={12} />
      </div>
    </div>
    <SkeletonLoader variant="text" count={3} className="mb-2" />
    <SkeletonLoader variant="rectangular" height={120} className="mt-4" />
  </div>
);
