import React from 'react';
import { useCulturalTheme } from '@/src/hooks/useCulturalTheme';
import { IndianRegion } from '@/src/types/localization';

interface CulturalPatternProps {
  region: IndianRegion;
  pattern?: string;
  size?: 'small' | 'medium' | 'large';
  opacity?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

/**
 * Cultural Pattern Component
 * Displays decorative cultural patterns as background elements
 */
export const CulturalPattern: React.FC<CulturalPatternProps> = ({ 
  region, 
  pattern,
  size = 'medium',
  opacity = 0.1,
  position = 'top-right'
}) => {
  const { patterns, colorScheme } = useCulturalTheme(region);
  
  const selectedPattern = pattern || patterns[0] || 'rangoli';
  
  const sizeMap = {
    small: '100px',
    medium: '200px',
    large: '300px'
  };

  const positionMap = {
    'top-left': { top: '1rem', left: '1rem' },
    'top-right': { top: '1rem', right: '1rem' },
    'bottom-left': { bottom: '1rem', left: '1rem' },
    'bottom-right': { bottom: '1rem', right: '1rem' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  };

  // SVG patterns for different cultural designs
  const patternSVGs: Record<string, JSX.Element> = {
    rangoli: (
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="rangoliGradient">
            <stop offset="0%" stopColor={colorScheme.primary} />
            <stop offset="100%" stopColor={colorScheme.secondary} />
          </radialGradient>
        </defs>
        {/* Rangoli pattern - circular mandala design */}
        <circle cx="100" cy="100" r="80" fill="none" stroke="url(#rangoliGradient)" strokeWidth="2" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="url(#rangoliGradient)" strokeWidth="2" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="url(#rangoliGradient)" strokeWidth="2" />
        <circle cx="100" cy="100" r="20" fill="url(#rangoliGradient)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="100"
            y1="100"
            x2={100 + 80 * Math.cos((angle * Math.PI) / 180)}
            y2={100 + 80 * Math.sin((angle * Math.PI) / 180)}
            stroke="url(#rangoliGradient)"
            strokeWidth="2"
          />
        ))}
      </svg>
    ),
    paisley: (
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="paisleyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorScheme.primary} />
            <stop offset="100%" stopColor={colorScheme.secondary} />
          </linearGradient>
        </defs>
        {/* Paisley pattern */}
        <path
          d="M100,50 Q150,50 150,100 Q150,150 100,150 Q80,150 70,130 Q60,110 70,90 Q80,70 100,70 Z"
          fill="url(#paisleyGradient)"
          opacity="0.8"
        />
        <path
          d="M100,70 Q130,70 130,100 Q130,130 100,130 Q85,130 80,115 Q75,100 80,85 Q85,70 100,70 Z"
          fill="none"
          stroke={colorScheme.accent}
          strokeWidth="2"
        />
      </svg>
    ),
    mandala: (
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="mandalaGradient">
            <stop offset="0%" stopColor={colorScheme.accent} />
            <stop offset="50%" stopColor={colorScheme.primary} />
            <stop offset="100%" stopColor={colorScheme.secondary} />
          </radialGradient>
        </defs>
        {/* Mandala pattern */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="url(#mandalaGradient)" strokeWidth="1" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="url(#mandalaGradient)" strokeWidth="1" />
        <circle cx="100" cy="100" r="50" fill="none" stroke="url(#mandalaGradient)" strokeWidth="1" />
        <circle cx="100" cy="100" r="30" fill="none" stroke="url(#mandalaGradient)" strokeWidth="1" />
        <circle cx="100" cy="100" r="10" fill="url(#mandalaGradient)" />
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          return (
            <g key={i}>
              <line
                x1="100"
                y1="100"
                x2={100 + 90 * Math.cos(angle)}
                y2={100 + 90 * Math.sin(angle)}
                stroke="url(#mandalaGradient)"
                strokeWidth="1"
              />
              <circle
                cx={100 + 70 * Math.cos(angle)}
                cy={100 + 70 * Math.sin(angle)}
                r="5"
                fill="url(#mandalaGradient)"
              />
            </g>
          );
        })}
      </svg>
    ),
    lotus: (
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lotusGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colorScheme.primary} />
            <stop offset="100%" stopColor={colorScheme.secondary} />
          </linearGradient>
        </defs>
        {/* Lotus pattern */}
        <ellipse cx="100" cy="150" rx="60" ry="30" fill="url(#lotusGradient)" opacity="0.6" />
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          return (
            <ellipse
              key={i}
              cx={100 + 40 * Math.cos(angle)}
              cy={100 + 40 * Math.sin(angle)}
              rx="25"
              ry="50"
              fill="url(#lotusGradient)"
              opacity="0.8"
              transform={`rotate(${i * 45}, ${100 + 40 * Math.cos(angle)}, ${100 + 40 * Math.sin(angle)})`}
            />
          );
        })}
        <circle cx="100" cy="100" r="20" fill={colorScheme.accent} />
      </svg>
    ),
    kolam: (
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="kolamGradient">
            <stop offset="0%" stopColor={colorScheme.primary} />
            <stop offset="100%" stopColor={colorScheme.secondary} />
          </linearGradient>
        </defs>
        {/* Kolam pattern - geometric dots and lines */}
        {[...Array(5)].map((_, row) =>
          [...Array(5)].map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={40 + col * 30}
              cy={40 + row * 30}
              r="3"
              fill="url(#kolamGradient)"
            />
          ))
        )}
        <path
          d="M40,40 L70,70 L100,40 L130,70 L160,40 M40,70 L70,100 L100,70 L130,100 L160,70 M40,100 L70,130 L100,100 L130,130 L160,100 M40,130 L70,160 L100,130 L130,160 L160,130"
          fill="none"
          stroke="url(#kolamGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    warli: (
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        {/* Warli art - tribal stick figures */}
        <g stroke={colorScheme.primary} strokeWidth="2" fill="none">
          {/* Dancing figures in a circle */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const x = 100 + 60 * Math.cos(angle);
            const y = 100 + 60 * Math.sin(angle);
            return (
              <g key={i}>
                <circle cx={x} cy={y - 10} r="5" fill={colorScheme.primary} />
                <line x1={x} y1={y - 5} x2={x} y2={y + 10} />
                <line x1={x - 8} y1={y} x2={x + 8} y2={y} />
                <line x1={x} y1={y + 10} x2={x - 6} y2={y + 20} />
                <line x1={x} y1={y + 10} x2={x + 6} y2={y + 20} />
              </g>
            );
          })}
          <circle cx="100" cy="100" r="70" stroke={colorScheme.secondary} strokeWidth="1" />
        </g>
      </svg>
    )
  };

  return (
    <div
      className="cultural-pattern"
      style={{
        position: 'absolute',
        width: sizeMap[size],
        height: sizeMap[size],
        opacity,
        pointerEvents: 'none',
        zIndex: 0,
        ...positionMap[position]
      }}
    >
      {patternSVGs[selectedPattern] || patternSVGs.rangoli}
    </div>
  );
};

/**
 * Cultural Border Component
 * Adds decorative cultural borders to containers
 */
export const CulturalBorder: React.FC<{ 
  region: IndianRegion; 
  children: React.ReactNode;
  pattern?: string;
}> = ({ region, children, pattern }) => {
  const { colorScheme } = useCulturalTheme(region);

  return (
    <div
      style={{
        position: 'relative',
        padding: '1.5rem',
        borderRadius: '12px',
        background: 'var(--color-surface)',
        border: `3px solid ${colorScheme.primary}`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.1), inset 0 0 0 1px ${colorScheme.secondary}`,
        overflow: 'hidden'
      }}
    >
      <CulturalPattern 
        region={region} 
        pattern={pattern}
        size="large" 
        opacity={0.05} 
        position="top-right" 
      />
      <CulturalPattern 
        region={region} 
        pattern={pattern}
        size="large" 
        opacity={0.05} 
        position="bottom-left" 
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};
