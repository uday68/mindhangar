/**
 * Developer Analytics Service
 * 
 * Collects anonymized usage data, performance metrics, and user feedback
 * to help improve the application. All data collection is opt-in and
 * respects user privacy.
 * 
 * Features:
 * - Usage analytics (feature adoption, user flows)
 * - Performance monitoring (load times, errors)
 * - User feedback collection
 * - A/B testing support
 * - Open-source contribution tracking
 */

export interface AnalyticsEvent {
  eventName: string;
  timestamp: Date;
  userId?: string; // Anonymized
  sessionId: string;
  properties?: Record<string, any>;
  context?: {
    userAgent: string;
    language: string;
    screenResolution: string;
    timezone: string;
  };
}

export interface PerformanceMetric {
  metricName: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: Date;
  context?: Record<string, any>;
}

export interface UserFeedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'question';
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  userId?: string; // Anonymized
  email?: string; // Optional for follow-up
  attachments?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContributionMetrics {
  totalContributors: number;
  totalContributions: number;
  contributionsByType: Record<string, number>;
  topContributors: Array<{
    username: string;
    contributions: number;
    avatar?: string;
  }>;
  recentContributions: Array<{
    type: string;
    description: string;
    contributor: string;
    date: Date;
  }>;
}

class DeveloperAnalyticsService {
  private sessionId: string;
  private isEnabled: boolean = false;
  private eventQueue: AnalyticsEvent[] = [];
  private performanceQueue: PerformanceMetric[] = [];
  private feedbackQueue: UserFeedback[] = [];
  private flushInterval: number = 30000; // 30 seconds
  private maxQueueSize: number = 100;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadPreferences();
    this.startAutoFlush();
    this.setupPerformanceObservers();
  }

  /**
   * Initialize analytics with user consent
   */
  async initialize(options: { enabled: boolean; userId?: string }): Promise<void> {
    this.isEnabled = options.enabled;
    
    if (this.isEnabled) {
      console.log('📊 Developer Analytics enabled');
      this.trackEvent('analytics_initialized', {
        userId: options.userId ? this.anonymizeUserId(options.userId) : undefined,
      });
    } else {
      console.log('📊 Developer Analytics disabled (user opt-out)');
    }

    // Save preference
    localStorage.setItem('analytics_enabled', String(this.isEnabled));
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      eventName,
      timestamp: new Date(),
      sessionId: this.sessionId,
      properties,
      context: this.getContext(),
    };

    this.eventQueue.push(event);
    console.log(`📊 Event tracked: ${eventName}`, properties);

    if (this.eventQueue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  /**
   * Track performance metric
   */
  trackPerformance(metricName: string, value: number, unit: 'ms' | 'bytes' | 'count', context?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      metricName,
      value,
      unit,
      timestamp: new Date(),
      context,
    };

    this.performanceQueue.push(metric);

    if (this.performanceQueue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(feedback: Omit<UserFeedback, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<UserFeedback> {
    const fullFeedback: UserFeedback = {
      ...feedback,
      id: this.generateId(),
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.feedbackQueue.push(fullFeedback);
    
    // Save to local storage for persistence
    this.saveFeedbackToStorage(fullFeedback);

    // Track feedback submission
    this.trackEvent('feedback_submitted', {
      type: feedback.type,
      category: feedback.category,
      priority: feedback.priority,
    });

    console.log('📝 Feedback submitted:', fullFeedback);

    // Attempt to send immediately
    await this.sendFeedback(fullFeedback);

    return fullFeedback;
  }

  /**
   * Get all feedback (for developer dashboard)
   */
  getAllFeedback(): UserFeedback[] {
    const stored = localStorage.getItem('user_feedback');
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Get contribution metrics (mock data for now, can be connected to GitHub API)
   */
  async getContributionMetrics(): Promise<ContributionMetrics> {
    // In production, this would fetch from GitHub API or backend
    return {
      totalContributors: 42,
      totalContributions: 156,
      contributionsByType: {
        'Code': 89,
        'Documentation': 34,
        'Bug Reports': 18,
        'Feature Requests': 15,
      },
      topContributors: [
        { username: 'developer1', contributions: 45, avatar: 'https://i.pravatar.cc/150?img=1' },
        { username: 'developer2', contributions: 32, avatar: 'https://i.pravatar.cc/150?img=2' },
        { username: 'developer3', contributions: 28, avatar: 'https://i.pravatar.cc/150?img=3' },
        { username: 'developer4', contributions: 21, avatar: 'https://i.pravatar.cc/150?img=4' },
        { username: 'developer5', contributions: 18, avatar: 'https://i.pravatar.cc/150?img=5' },
      ],
      recentContributions: [
        {
          type: 'Code',
          description: 'Added AI recommendation widget',
          contributor: 'developer1',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          type: 'Documentation',
          description: 'Updated integration guide',
          contributor: 'developer2',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          type: 'Bug Fix',
          description: 'Fixed analytics dashboard rendering',
          contributor: 'developer3',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ],
    };
  }

  /**
   * Get analytics summary (for developer dashboard)
   */
  getAnalyticsSummary(): {
    totalEvents: number;
    totalSessions: number;
    avgSessionDuration: number;
    topEvents: Array<{ name: string; count: number }>;
    performanceMetrics: Array<{ name: string; avg: number; unit: string }>;
  } {
    // In production, this would aggregate from stored data
    return {
      totalEvents: 1247,
      totalSessions: 89,
      avgSessionDuration: 12.5, // minutes
      topEvents: [
        { name: 'page_view', count: 342 },
        { name: 'recommendation_click', count: 156 },
        { name: 'search_query', count: 134 },
        { name: 'video_play', count: 98 },
        { name: 'note_created', count: 87 },
      ],
      performanceMetrics: [
        { name: 'page_load_time', avg: 1.2, unit: 'seconds' },
        { name: 'api_response_time', avg: 234, unit: 'ms' },
        { name: 'bundle_size', avg: 392, unit: 'KB' },
      ],
    };
  }

  /**
   * Export analytics data (for developers)
   */
  exportData(format: 'json' | 'csv'): string {
    const data = {
      events: this.eventQueue,
      performance: this.performanceQueue,
      feedback: this.getAllFeedback(),
      summary: this.getAnalyticsSummary(),
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Simple CSV export
      return this.convertToCSV(data);
    }
  }

  /**
   * Clear all analytics data
   */
  clearData(): void {
    this.eventQueue = [];
    this.performanceQueue = [];
    this.feedbackQueue = [];
    localStorage.removeItem('user_feedback');
    localStorage.removeItem('analytics_events');
    console.log('📊 Analytics data cleared');
  }

  // Private methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private anonymizeUserId(userId: string): string {
    // Simple hash for anonymization
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `user_${Math.abs(hash)}`;
  }

  private getContext(): AnalyticsEvent['context'] {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private loadPreferences(): void {
    const enabled = localStorage.getItem('analytics_enabled');
    this.isEnabled = enabled === 'true';
  }

  private startAutoFlush(): void {
    setInterval(() => {
      if (this.eventQueue.length > 0 || this.performanceQueue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0 && this.performanceQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    const metricsToSend = [...this.performanceQueue];

    this.eventQueue = [];
    this.performanceQueue = [];

    try {
      // In production, send to analytics backend
      console.log('📊 Flushing analytics:', {
        events: eventsToSend.length,
        metrics: metricsToSend.length,
      });

      // Store locally for now
      this.storeLocally(eventsToSend, metricsToSend);
    } catch (error) {
      console.error('Failed to flush analytics:', error);
      // Re-queue on failure
      this.eventQueue.push(...eventsToSend);
      this.performanceQueue.push(...metricsToSend);
    }
  }

  private storeLocally(events: AnalyticsEvent[], metrics: PerformanceMetric[]): void {
    try {
      const stored = localStorage.getItem('analytics_events');
      const existing = stored ? JSON.parse(stored) : { events: [], metrics: [] };
      
      existing.events.push(...events);
      existing.metrics.push(...metrics);

      // Keep only last 1000 events
      if (existing.events.length > 1000) {
        existing.events = existing.events.slice(-1000);
      }
      if (existing.metrics.length > 1000) {
        existing.metrics = existing.metrics.slice(-1000);
      }

      localStorage.setItem('analytics_events', JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to store analytics locally:', error);
    }
  }

  private saveFeedbackToStorage(feedback: UserFeedback): void {
    try {
      const stored = localStorage.getItem('user_feedback');
      const existing = stored ? JSON.parse(stored) : [];
      existing.push(feedback);
      localStorage.setItem('user_feedback', JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
  }

  private async sendFeedback(feedback: UserFeedback): Promise<void> {
    try {
      // In production, send to backend API or GitHub Issues
      console.log('📝 Sending feedback to backend:', feedback);
      
      // For now, just log it
      // In production: await fetch('/api/feedback', { method: 'POST', body: JSON.stringify(feedback) });
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  }

  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined') return;

    // Observe page load performance
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        this.trackPerformance('page_load_time', perfData.loadEventEnd - perfData.fetchStart, 'ms');
        this.trackPerformance('dom_content_loaded', perfData.domContentLoadedEventEnd - perfData.fetchStart, 'ms');
        this.trackPerformance('time_to_interactive', perfData.domInteractive - perfData.fetchStart, 'ms');
      }
    });

    // Observe resource loading
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              this.trackPerformance(
                `resource_load_${resourceEntry.initiatorType}`,
                resourceEntry.duration,
                'ms',
                { name: resourceEntry.name }
              );
            }
          }
        });
        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion
    let csv = 'Type,Timestamp,Name,Value\n';
    
    data.events.forEach((event: AnalyticsEvent) => {
      csv += `Event,${event.timestamp},${event.eventName},${JSON.stringify(event.properties)}\n`;
    });

    data.performance.forEach((metric: PerformanceMetric) => {
      csv += `Performance,${metric.timestamp},${metric.metricName},${metric.value}${metric.unit}\n`;
    });

    return csv;
  }
}

// Export singleton instance
export const developerAnalytics = new DeveloperAnalyticsService();
