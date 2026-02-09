/**
 * Accessibility Context Provider
 * Provides ARIA live regions, focus management, and accessibility utilities
 */

import React, { createContext, useContext, useRef, useCallback, useState, useEffect } from 'react';

interface AccessibilityContextValue {
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  setFocusTarget: (elementId: string) => void;
  skipToContent: () => void;
  registerLandmark: (id: string, label: string) => void;
  unregisterLandmark: (id: string) => void;
  landmarks: Map<string, string>;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  const [landmarks, setLandmarks] = useState<Map<string, string>>(new Map());

  /**
   * Announce message to screen readers via ARIA live regions
   */
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = priority === 'assertive' ? assertiveRef.current : politeRef.current;
    
    if (liveRegion) {
      // Clear previous message
      liveRegion.textContent = '';
      
      // Set new message after a brief delay to ensure screen readers pick it up
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 100);
      
      // Clear message after it's been announced
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 5000);
    }
  }, []);

  /**
   * Set focus to a specific element by ID
   */
  const setFocusTarget = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      // Announce focus change to screen readers
      const label = element.getAttribute('aria-label') || element.textContent || 'Element';
      announceToScreenReader(`Focused on ${label}`, 'polite');
    }
  }, [announceToScreenReader]);

  /**
   * Skip to main content (used by skip links)
   */
  const skipToContent = useCallback(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      announceToScreenReader('Skipped to main content', 'polite');
    }
  }, [announceToScreenReader]);

  /**
   * Register a landmark for navigation
   */
  const registerLandmark = useCallback((id: string, label: string) => {
    setLandmarks(prev => new Map(prev).set(id, label));
  }, []);

  /**
   * Unregister a landmark
   */
  const unregisterLandmark = useCallback((id: string) => {
    setLandmarks(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  // Detect if user is navigating with keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const value: AccessibilityContextValue = {
    announceToScreenReader,
    setFocusTarget,
    skipToContent,
    registerLandmark,
    unregisterLandmark,
    landmarks,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {/* ARIA Live Regions */}
      <div
        ref={politeRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        ref={assertiveRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
      
      {children}
    </AccessibilityContext.Provider>
  );
};
