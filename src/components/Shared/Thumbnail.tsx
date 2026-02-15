import React, { useState } from 'react';
import { Icons } from '../Icons';

interface ThumbnailProps {
  src?: string;
  fallbackIcon?: React.ElementType; // Pass specific icon from Icons object
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  aspect?: 'square' | 'video' | 'auto';
  bgColor?: string; // Optional custom bg color class (e.g. 'bg-red-100')
  iconColor?: string; // Optional custom icon color class (e.g. 'text-red-600')
}

export const Thumbnail: React.FC<ThumbnailProps> = ({
  src,
  fallbackIcon: Icon = Icons.FileText,
  alt = 'Thumbnail',
  className = '',
  size = 'md',
  aspect = 'square',
  bgColor = 'bg-gray-100',
  iconColor = 'text-gray-400'
}) => {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    full: "w-full"
  };

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: ""
  };

  return (
    <div className={`relative overflow-hidden rounded-lg shrink-0 flex items-center justify-center ${bgColor} ${sizeClasses[size]} ${aspectClasses[aspect]} ${className}`}>
      {src && !error ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
          onError={() => setError(true)}
        />
      ) : (
        <div className={`${iconColor}`}>
          <Icon size={size === 'sm' ? 14 : size === 'lg' ? 24 : 18} />
        </div>
      )}
    </div>
  );
};