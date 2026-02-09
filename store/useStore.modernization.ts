/**
 * Store Extension for Frontend Modernization
 * Adds accessibility, animation, loading, error, and AI service state
 */

// New state interfaces for modernization
export interface AccessibilityState {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReaderActive: boolean;
  keyboardNavigationMode: boolean;
}

export interface AnimationState {
  enabled: boolean;
  duration: 'fast' | 'normal' | 'slow';
  pageTransitionsEnabled: boolean;
  microInteractionsEnabled: boolean;
  scrollAnimationsEnabled: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  loadingType: 'skeleton' | 'spinner' | 'progress' | 'optimistic';
  progress?: number;
  message?: string;
}

export interface ErrorState {
  error: Error | string | null;
  severity: 'error' | 'warning' | 'info';
  timestamp: Date;
}

export interface AIServiceStates {
  recommendations: {
    data: any[];
    lastFetched: Date | null;
    loading: boolean;
    error: Error | null;
  };
  analytics: {
    data: any | null;
    timeRange: 'day' | 'week' | 'month';
    loading: boolean;
    error: Error | null;
  };
  progress: {
    data: any | null;
    loading: boolean;
    error: Error | null;
  };
  predictions: {
    data: any[];
    loading: boolean;
    error: Error | null;
  };
  culturalContext: {
    data: any | null;
    loading: boolean;
    error: Error | null;
  };
  contentGeneration: {
    queue: Array<{ topic: string; type: string }>;
    results: Record<string, any>;
    loading: boolean;
    error: Error | null;
  };
}

// Extended state interface
export interface ModernizationState {
  // Accessibility
  accessibility: AccessibilityState;
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setScreenReaderActive: (active: boolean) => void;
  setKeyboardNavigationMode: (active: boolean) => void;

  // Animations
  animations: AnimationState;
  setAnimationsEnabled: (enabled: boolean) => void;
  setAnimationDuration: (duration: 'fast' | 'normal' | 'slow') => void;
  setPageTransitionsEnabled: (enabled: boolean) => void;
  setMicroInteractionsEnabled: (enabled: boolean) => void;
  setScrollAnimationsEnabled: (enabled: boolean) => void;

  // Loading states
  loadingStates: Record<string, LoadingState>;
  setLoading: (key: string, state: LoadingState) => void;
  clearLoading: (key: string) => void;
  isAnyLoading: () => boolean;

  // Error states
  errorStates: Record<string, ErrorState>;
  setError: (key: string, error: Error | string, severity?: 'error' | 'warning' | 'info') => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;

  // AI Services
  aiServices: AIServiceStates;
  fetchRecommendations: () => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  dismissRecommendation: (id: string) => void;
  fetchAnalytics: (timeRange: 'day' | 'week' | 'month') => Promise<void>;
  fetchProgress: () => Promise<void>;
  fetchPredictions: (subject?: string) => Promise<void>;
  dismissPrediction: (id: string) => void;
  fetchCulturalContext: () => Promise<void>;
  updateCulturalPreferences: (preferences: any) => void;
  generateContent: (topic: string, type: string) => Promise<any>;
  regenerateContent: (id: string) => Promise<any>;
}

// Default states
export const defaultAccessibilityState: AccessibilityState = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  screenReaderActive: false,
  keyboardNavigationMode: false,
};

export const defaultAnimationState: AnimationState = {
  enabled: true,
  duration: 'normal',
  pageTransitionsEnabled: true,
  microInteractionsEnabled: true,
  scrollAnimationsEnabled: true,
};

export const defaultAIServiceStates: AIServiceStates = {
  recommendations: {
    data: [],
    lastFetched: null,
    loading: false,
    error: null,
  },
  analytics: {
    data: null,
    timeRange: 'week',
    loading: false,
    error: null,
  },
  progress: {
    data: null,
    loading: false,
    error: null,
  },
  predictions: {
    data: [],
    loading: false,
    error: null,
  },
  culturalContext: {
    data: null,
    loading: false,
    error: null,
  },
  contentGeneration: {
    queue: [],
    results: {},
    loading: false,
    error: null,
  },
};

// Store slice creator for modernization features
export const createModernizationSlice = (set: any, get: any) => ({
  // Accessibility state
  accessibility: defaultAccessibilityState,
  
  setReducedMotion: (enabled: boolean) =>
    set((state: any) => ({
      accessibility: { ...state.accessibility, reducedMotion: enabled },
    })),
  
  setHighContrast: (enabled: boolean) =>
    set((state: any) => ({
      accessibility: { ...state.accessibility, highContrast: enabled },
    })),
  
  setFontSize: (size: 'small' | 'medium' | 'large') =>
    set((state: any) => ({
      accessibility: { ...state.accessibility, fontSize: size },
    })),
  
  setScreenReaderActive: (active: boolean) =>
    set((state: any) => ({
      accessibility: { ...state.accessibility, screenReaderActive: active },
    })),
  
  setKeyboardNavigationMode: (active: boolean) =>
    set((state: any) => ({
      accessibility: { ...state.accessibility, keyboardNavigationMode: active },
    })),

  // Animation state
  animations: defaultAnimationState,
  
  setAnimationsEnabled: (enabled: boolean) =>
    set((state: any) => ({
      animations: { ...state.animations, enabled },
    })),
  
  setAnimationDuration: (duration: 'fast' | 'normal' | 'slow') =>
    set((state: any) => ({
      animations: { ...state.animations, duration },
    })),
  
  setPageTransitionsEnabled: (enabled: boolean) =>
    set((state: any) => ({
      animations: { ...state.animations, pageTransitionsEnabled: enabled },
    })),
  
  setMicroInteractionsEnabled: (enabled: boolean) =>
    set((state: any) => ({
      animations: { ...state.animations, microInteractionsEnabled: enabled },
    })),
  
  setScrollAnimationsEnabled: (enabled: boolean) =>
    set((state: any) => ({
      animations: { ...state.animations, scrollAnimationsEnabled: enabled },
    })),

  // Loading states
  loadingStates: {} as Record<string, LoadingState>,
  
  setLoading: (key: string, state: LoadingState) =>
    set((s: any) => ({
      loadingStates: { ...s.loadingStates, [key]: state },
    })),
  
  clearLoading: (key: string) =>
    set((s: any) => {
      const newStates = { ...s.loadingStates };
      delete newStates[key];
      return { loadingStates: newStates };
    }),
  
  isAnyLoading: () => {
    const states = get().loadingStates;
    return Object.values(states).some((s: any) => s.isLoading);
  },

  // Error states
  errorStates: {} as Record<string, ErrorState>,
  
  setError: (key: string, error: Error | string, severity: 'error' | 'warning' | 'info' = 'error') =>
    set((s: any) => ({
      errorStates: {
        ...s.errorStates,
        [key]: {
          error,
          severity,
          timestamp: new Date(),
        },
      },
    })),
  
  clearError: (key: string) =>
    set((s: any) => {
      const newStates = { ...s.errorStates };
      delete newStates[key];
      return { errorStates: newStates };
    }),
  
  clearAllErrors: () => set({ errorStates: {} }),

  // AI Services state
  aiServices: defaultAIServiceStates,
  
  fetchRecommendations: async () => {
    set((state: any) => ({
      aiServices: {
        ...state.aiServices,
        recommendations: { ...state.aiServices.recommendations, loading: true, error: null },
      },
    }));

    try {
      const { recommendationService } = await import('../src/services/RecommendationService');
      const userId = get().user?.id || 'guest';
      const data = await recommendationService.getNextContent(userId, 5);
      
      set((state: any) => ({
        aiServices: {
          ...state.aiServices,
          recommendations: {
            data,
            lastFetched: new Date(),
            loading: false,
            error: null,
          },
        },
      }));
    } catch (error) {
      set((state: any) => ({
        aiServices: {
          ...state.aiServices,
          recommendations: {
            ...state.aiServices.recommendations,
            loading: false,
            error: error as Error,
          },
        },
      }));
    }
  },

  refreshRecommendations: async () => {
    const { fetchRecommendations } = get();
    await fetchRecommendations();
  },

  dismissRecommendation: (id: string) => {
    set((state: any) => ({
      aiServices: {
        ...state.aiServices,
        recommendations: {
          ...state.aiServices.recommendations,
          data: state.aiServices.recommendations.data.filter((r: any) => r.id !== id),
        },
      },
    }));
  },

  fetchAnalytics: async (timeRange: 'day' | 'week' | 'month') => {
    set((state: any) => ({
      aiServices: {
        ...state.aiServices,
        analytics: { ...state.aiServices.analytics, loading: true, error: null, timeRange },
      },
    }));

    try {
      const { analyticsService } = await import('../src/services/AnalyticsService');
      const userId = get().user?.id || 'guest';
      const patterns = await analyticsService.analyzeLearningPatterns(userId);
      const metrics = await analyticsService.getUsageMetrics();
      
      set((state: any) => ({
        aiServices: {
          ...state.aiServices,
          analytics: {
            data: { patterns, metrics },
            timeRange,
            loading: false,
            error: null,
          },
        },
      }));
    } catch (error) {
      set((state: any) => ({
        aiServices: {
          ...state.aiServices,
          analytics: {
            ...state.aiServices.analytics,
            loading: false,
            error: error as Error,
          },
        },
      }));
    }
  },

  fetchProgress: async () => {
    set((state: any) => ({
      aiServices: {
        ...state.aiServices,
        progress: { ...state.aiServices.progress, loading: true, error: null },
      },
    }));

    try {
      const { progressService } = await import('../src/services/ProgressService');
      const userId = get().user?.id || 'guest';
      const data = await progressService.getUserProgress(userId);
      
      set((state: any) => ({
        aiServices: {
          ...state.aiServices,
          progress: {
            data,
            loading: false,
            error: null,
          },
        },
      }));
    } catch (error) {
      set((state: any) => ({
        aiServices: {
          ...state.aiServices,
          progress: {
            ...state.aiServices.progress,
            loading: false,
            error: error as Error,
          },
        },
      }));
    }
  },

  fetchPredictions: async (subject?: string) => {
    set((state: any) => ({
      aiServices: {
        ...state.aiServices,
        predictions: { ...state.aiServices.predictions, loading: true, error: null },
      },
    }));

    try {
      // Mock predictions for now
      const data = [
        {
          id: '1',
          subject: subject || 'Mathematics',
          predictedPerformance: 75,
          confidence: 85,
          learningGaps: ['Geometry', 'Trigonometry'],
          recommendations: ['Practice more geometry problems', 'Review trigonometric identities'],
          severity: 'medium' as const,
        },
      ];
      
      set((state: any) => ({
        aiServices: {
          ...state.aiServices,
          predictions: {
            data,
            loading: false,
            error: null,
          },
        },
      }));
    } catch (error) {
      set((state: any) => ({
        aiServices: {
          ...state.aiServices,
          predictions: {
            ...state.aiServices.predictions,
            loading: false,
            error: error as Error,
          },
        },
      }));
    }
  },

  dismissPrediction: (id: string) => {
    set((state: any) => ({
      aiServices: {
        ...state.aiServices,
        predictions: {
          ...state.aiServices.predictions,
          data: state.aiServices.predictions.data.filter((p: any) => p.id !== id),
        },
      },
    }));
  },

  fetchCulturalContext: async () => {
    set((state: any) => ({
      aiServices: {
        ...state.aiServices,
        culturalContext: { ...state.aiServices.culturalContext, loading: true, error: null },
      },
    }));

    try {
      const { culturalFilter } = await import('../src/services/CulturalFilter');
      const userId = get().user?.id || 'guest';
      const data = culturalFilter.getUserCulturalContext(userId);
      
      set((state: any) => ({
        aiServices: {
          ...state.aiServices,
          culturalContext: {
            data,
            loading: false,
            error: null,
          },
        },
      }));
    } catch (error) {
      set((state: any) => ({
        aiServices: {
          ...state.aiServices,
          culturalContext: {
            ...state.aiServices.culturalContext,
            loading: false,
            error: error as Error,
          },
        },
      }));
    }
  },

  updateCulturalPreferences: (preferences: any) => {
    set((state: any) => ({
      aiServices: {
        ...state.aiServices,
        culturalContext: {
          ...state.aiServices.culturalContext,
          data: { ...state.aiServices.culturalContext.data, ...preferences },
        },
      },
    }));
  },

  generateContent: async (topic: string, type: string) => {
    set((state: any) => ({
      aiServices: {
        ...state.aiServices,
        contentGeneration: {
          ...state.aiServices.contentGeneration,
          loading: true,
          error: null,
          queue: [...state.aiServices.contentGeneration.queue, { topic, type }],
        },
      },
    }));

    try {
      // Mock content generation
      const content = {
        id: `content_${Date.now()}`,
        type,
        content: `Generated content for ${topic}`,
        metadata: {
          difficulty: 'medium' as const,
          estimatedTime: 15,
          subject: topic,
          topic,
        },
      };
      
      set((state: any) => ({
        aiServices: {
          ...state.aiServices,
          contentGeneration: {
            queue: state.aiServices.contentGeneration.queue.filter(
              (q: any) => q.topic !== topic || q.type !== type
            ),
            results: {
              ...state.aiServices.contentGeneration.results,
              [content.id]: content,
            },
            loading: false,
            error: null,
          },
        },
      }));

      return content;
    } catch (error) {
      set((state: any) => ({
        aiServices: {
          ...state.aiServices,
          contentGeneration: {
            ...state.aiServices.contentGeneration,
            loading: false,
            error: error as Error,
          },
        },
      }));
      throw error;
    }
  },

  regenerateContent: async (id: string) => {
    const content = get().aiServices.contentGeneration.results[id];
    if (!content) throw new Error('Content not found');
    
    return get().generateContent(content.metadata.topic, content.type);
  },
});
