/**
 * Analytics Service - Tracks user behavior and learning patterns
 * Provides insights for personalized learning recommendations
 */

import { bandwidthOptimizer } from './BandwidthOptimizer';

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  eventData: any;
  timestamp: Date;
  sessionId?: string;
}

export interface LearningPattern {
  userId: string;
  preferredStudyTime: string; // e.g., "morning", "afternoon", "evening", "night"
  averageSessionDuration: number; // in minutes
  mostProductiveDay: string;
  preferredContentType: string; // "video", "quiz", "notes", "flashcards"
  focusScore: number; // 0-100
  completionRate: number; // 0-100
}

export interface UsageMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  totalContentCreated: number;
  totalQuizzesCompleted: number;
  averageQuizScore: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private readonly MAX_EVENTS = 1000; // Keep last 1000 events in memory

  /**
   * Track an event
   */
  async trackEvent(
    userId: string,
    eventType: string,
    eventData: any = {},
    sessionId?: string
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      eventType,
      eventData,
      timestamp: new Date(),
      sessionId,
    };

    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Save to localStorage
    this.saveEvents();

    // Track data usage
    bandwidthOptimizer.trackDataUsage(JSON.stringify(event).length, 'api');
  }

  /**
   * Track page view
   */
  async trackPageView(userId: string, page: string, sessionId?: string): Promise<void> {
    await this.trackEvent(userId, 'page_view', { page }, sessionId);
  }

  /**
   * Track content interaction
   */
  async trackContentInteraction(
    userId: string,
    contentId: string,
    contentType: string,
    action: 'view' | 'create' | 'edit' | 'delete' | 'complete',
    sessionId?: string
  ): Promise<void> {
    await this.trackEvent(
      userId,
      'content_interaction',
      { contentId, contentType, action },
      sessionId
    );
  }

  /**
   * Track quiz attempt
   */
  async trackQuizAttempt(
    userId: string,
    quizId: string,
    score: number,
    totalQuestions: number,
    timeSpent: number,
    sessionId?: string
  ): Promise<void> {
    await this.trackEvent(
      userId,
      'quiz_attempt',
      { quizId, score, totalQuestions, timeSpent, percentage: (score / totalQuestions) * 100 },
      sessionId
    );
  }

  /**
   * Track study session
   */
  async trackStudySession(
    userId: string,
    duration: number,
    focusScore: number,
    distractions: number,
    contentIds: string[]
  ): Promise<void> {
    await this.trackEvent(userId, 'study_session', {
      duration,
      focusScore,
      distractions,
      contentIds,
      contentCount: contentIds.length,
    });
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(
    userId: string,
    feature: string,
    action: string,
    metadata?: any
  ): Promise<void> {
    await this.trackEvent(userId, 'feature_usage', {
      feature,
      action,
      ...metadata,
    });
  }

  /**
   * Track error
   */
  async trackError(
    userId: string,
    error: Error,
    context?: string
  ): Promise<void> {
    await this.trackEvent(userId, 'error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  /**
   * Get user events
   */
  async getUserEvents(
    userId: string,
    eventType?: string,
    limit: number = 100
  ): Promise<AnalyticsEvent[]> {
    let filtered = this.events.filter(e => e.userId === userId);

    if (eventType) {
      filtered = filtered.filter(e => e.eventType === eventType);
    }

    return filtered.slice(-limit);
  }

  /**
   * Analyze learning patterns
   */
  async analyzeLearningPatterns(userId: string): Promise<LearningPattern> {
    const events = await this.getUserEvents(userId);
    
    // Analyze study time preferences
    const studyTimes = events
      .filter(e => e.eventType === 'study_session')
      .map(e => {
        const hour = new Date(e.timestamp).getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
      });

    const preferredStudyTime = this.getMostFrequent(studyTimes) || 'evening';

    // Calculate average session duration
    const sessionEvents = events.filter(e => e.eventType === 'study_session');
    const averageSessionDuration = sessionEvents.length > 0
      ? sessionEvents.reduce((sum, e) => sum + (e.eventData.duration || 0), 0) / sessionEvents.length / 60
      : 0;

    // Find most productive day
    const days = events.map(e => new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'long' }));
    const mostProductiveDay = this.getMostFrequent(days) || 'Monday';

    // Analyze content type preferences
    const contentInteractions = events.filter(e => e.eventType === 'content_interaction');
    const contentTypes = contentInteractions.map(e => e.eventData.contentType);
    const preferredContentType = this.getMostFrequent(contentTypes) || 'video';

    // Calculate focus score
    const focusScores = sessionEvents.map(e => e.eventData.focusScore || 0);
    const focusScore = focusScores.length > 0
      ? focusScores.reduce((sum, score) => sum + score, 0) / focusScores.length
      : 0;

    // Calculate completion rate
    const completedContent = contentInteractions.filter(e => e.eventData.action === 'complete').length;
    const totalContent = contentInteractions.filter(e => e.eventData.action === 'view').length;
    const completionRate = totalContent > 0 ? (completedContent / totalContent) * 100 : 0;

    return {
      userId,
      preferredStudyTime,
      averageSessionDuration,
      mostProductiveDay,
      preferredContentType,
      focusScore,
      completionRate,
    };
  }

  /**
   * Get usage metrics
   */
  async getUsageMetrics(): Promise<UsageMetrics> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyUsers = new Set(
      this.events
        .filter(e => new Date(e.timestamp) > oneDayAgo)
        .map(e => e.userId)
    ).size;

    const weeklyUsers = new Set(
      this.events
        .filter(e => new Date(e.timestamp) > oneWeekAgo)
        .map(e => e.userId)
    ).size;

    const monthlyUsers = new Set(
      this.events
        .filter(e => new Date(e.timestamp) > oneMonthAgo)
        .map(e => e.userId)
    ).size;

    const sessionEvents = this.events.filter(e => e.eventType === 'study_session');
    const averageSessionDuration = sessionEvents.length > 0
      ? sessionEvents.reduce((sum, e) => sum + (e.eventData.duration || 0), 0) / sessionEvents.length / 60
      : 0;

    const contentCreated = this.events.filter(
      e => e.eventType === 'content_interaction' && e.eventData.action === 'create'
    ).length;

    const quizEvents = this.events.filter(e => e.eventType === 'quiz_attempt');
    const totalQuizzes = quizEvents.length;
    const averageQuizScore = totalQuizzes > 0
      ? quizEvents.reduce((sum, e) => sum + (e.eventData.percentage || 0), 0) / totalQuizzes
      : 0;

    return {
      dailyActiveUsers: dailyUsers,
      weeklyActiveUsers: weeklyUsers,
      monthlyActiveUsers: monthlyUsers,
      averageSessionDuration,
      totalContentCreated: contentCreated,
      totalQuizzesCompleted: totalQuizzes,
      averageQuizScore,
    };
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId: string): Promise<string[]> {
    const patterns = await this.analyzeLearningPatterns(userId);
    const recommendations: string[] = [];

    // Recommend based on study time
    if (patterns.preferredStudyTime === 'morning') {
      recommendations.push('Schedule challenging topics in the morning when you\'re most productive');
    }

    // Recommend based on session duration
    if (patterns.averageSessionDuration < 20) {
      recommendations.push('Try extending your study sessions to 25-30 minutes for better retention');
    } else if (patterns.averageSessionDuration > 60) {
      recommendations.push('Consider taking breaks every 45-50 minutes to maintain focus');
    }

    // Recommend based on focus score
    if (patterns.focusScore < 70) {
      recommendations.push('Enable Focus Mode to minimize distractions during study sessions');
    }

    // Recommend based on completion rate
    if (patterns.completionRate < 50) {
      recommendations.push('Set smaller, achievable goals to improve completion rate');
    }

    // Recommend content variety
    if (patterns.preferredContentType === 'video') {
      recommendations.push('Try mixing in quizzes and flashcards for active recall practice');
    }

    return recommendations;
  }

  /**
   * Export analytics data
   */
  async exportData(userId: string): Promise<string> {
    const events = await this.getUserEvents(userId);
    const patterns = await this.analyzeLearningPatterns(userId);

    const data = {
      user: userId,
      exportDate: new Date().toISOString(),
      totalEvents: events.length,
      patterns,
      events: events.map(e => ({
        type: e.eventType,
        timestamp: e.timestamp,
        data: e.eventData,
      })),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Clear user data
   */
  async clearUserData(userId: string): Promise<void> {
    this.events = this.events.filter(e => e.userId !== userId);
    this.saveEvents();
  }

  /**
   * Helper: Get most frequent item in array
   */
  private getMostFrequent<T>(arr: T[]): T | null {
    if (arr.length === 0) return null;

    const frequency = new Map<T, number>();
    arr.forEach(item => {
      frequency.set(item, (frequency.get(item) || 0) + 1);
    });

    let maxCount = 0;
    let mostFrequent: T | null = null;

    frequency.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = item;
      }
    });

    return mostFrequent;
  }

  /**
   * Save events to localStorage
   */
  private saveEvents(): void {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-this.MAX_EVENTS)));
    } catch (error) {
      console.error('Error saving analytics events:', error);
    }
  }

  /**
   * Load events from localStorage
   */
  loadEvents(): void {
    try {
      const stored = localStorage.getItem('analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading analytics events:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();

// Load events on initialization
analyticsService.loadEvents();
