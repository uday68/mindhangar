/**
 * Animation Context Provider
 * Manages global animation settings and respects user preferences
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface AnimationConfig {
  enabled: boolean;
  respectReducedMotion: boolean;
  duration: {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
    slower: number;
  };
  easing: {
    linear: number[];
    easeIn: number[];
    easeOut: number[];
    easeInOut: number[];
  };
  spring: {
    gentle: { stiffness: number; damping: number };
    bouncy: { stiffness: number; damping: number };
    stiff: { stiffness: number; damping: number };
  };
}

interface AnimationContextValue {
  config: AnimationConfig;
  isReducedMotion: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  setDuration: (key: keyof AnimationConfig['duration'], value: number) => void;
  shouldAnimate: boolean;
}

const defaultConfig: AnimationConfig = {
  enabled: true,
  respectReducedMotion: true,
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },
  easing: {
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
  },
  spring: {
    gentle: { stiffness: 100, damping: 15 },
    bouncy: { stiffness: 300, damping: 20 },
    stiff: { stiffness: 400, damping: 30 },
  },
};

const AnimationContext = createContext<AnimationContextValue | null>(null);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }
  return context;
};

interface AnimationProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<AnimationConfig>;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ 
  children, 
  initialConfig 
}) => {
  const [config, setConfig] = useState<AnimationConfig>({
    ...defaultConfig,
    ...initialConfig,
  });

  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsReducedMotion(e.matches);
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Load animation preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('mindhangar-animations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse animation config:', error);
      }
    }
  }, []);

  // Save animation preferences to localStorage
  useEffect(() => {
    localStorage.setItem('mindhangar-animations', JSON.stringify({
      enabled: config.enabled,
      respectReducedMotion: config.respectReducedMotion,
    }));
  }, [config.enabled, config.respectReducedMotion]);

  const setAnimationsEnabled = (enabled: boolean) => {
    setConfig(prev => ({ ...prev, enabled }));
  };

  const setDuration = (key: keyof AnimationConfig['duration'], value: number) => {
    setConfig(prev => ({
      ...prev,
      duration: { ...prev.duration, [key]: value },
    }));
  };

  // Determine if animations should be active
  const shouldAnimate = useMemo(() => {
    if (!config.enabled) return false;
    if (config.respectReducedMotion && isReducedMotion) return false;
    return true;
  }, [config.enabled, config.respectReducedMotion, isReducedMotion]);

  const value: AnimationContextValue = {
    config,
    isReducedMotion,
    setAnimationsEnabled,
    setDuration,
    shouldAnimate,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

// Animation variant helpers
export const getAnimationVariants = (shouldAnimate: boolean) => ({
  pageTransition: {
    initial: shouldAnimate ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 },
    animate: { opacity: 1, x: 0 },
    exit: shouldAnimate ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 },
  },
  fadeIn: {
    hidden: shouldAnimate ? { opacity: 0 } : { opacity: 1 },
    visible: { opacity: 1 },
  },
  slideIn: {
    hidden: shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  },
  scaleIn: {
    hidden: shouldAnimate ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 },
    visible: { opacity: 1, scale: 1 },
  },
  skeleton: {
    start: { opacity: 0.6 },
    end: { opacity: 1 },
  },
});
