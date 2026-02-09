/**
 * AI Service Facade
 * 
 * Unified interface for all AI services in the application.
 * Provides a single entry point for AI-powered features with
 * error handling, retry logic, and caching.
 */

import { recommendationService } from './RecommendationService';
import { analyticsService } from './AnalyticsService';
import { progressService } from './ProgressService';
import { performancePredictionModel } from './ai/PerformancePredictionModel';
import { culturalContextModel } from './ai/CulturalContextModel';
import { educationalContentModel } from './ai/EducationalContentModel';
import { contentRecommenderModel } from './ai/ContentRecommenderModel';

// Types
export interface ServiceResponse<T> {
  data?: T;
  error?: Error;
  loading: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
}

// Default configurations
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
};

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes
};

/**
 * AI Service Facade Class
 * 
 * Provides unified access to all AI services with:
 * - Error handling
 * - Retry logic with exponential backoff
 * - Response caching
 * - Loading state management
 */
class AIServiceFacade {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG;
  private cacheConfig: CacheConfig = DEFAULT_CACHE_CONFIG;

  /**
   * Configure retry behavior
   */
  setRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * Configure cache behavior
   */
  setCacheConfig(config: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config };
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Get cached data if available and not expired
   */
  private getCachedData<T>(key: string): T | null {
    if (!this.cacheConfig.enabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > this.cacheConfig.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set cached data
   */
  private setCachedData<T>(key: string, data: T): void {
    if (!this.cacheConfig.enabled) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Execute function with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.retryConfig.maxRetries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }

      const delay = this.retryConfig.retryDelay * Math.pow(
        this.retryConfig.backoffMultiplier,
        this.retryConfig.maxRetries - retries
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.executeWithRetry(fn, retries - 1);
    }
  }

  /**
   * Wrap service call with error handling and caching
   */
  private async wrapServiceCall<T>(
    cacheKey: string,
    serviceFn: () => Promise<T>
  ): Promise<ServiceResponse<T>> {
    try {
      // Check cache first
      const cachedData = this.getCachedData<T>(cacheKey);
      if (cachedData) {
        return {
          data: cachedData,
          loading: false,
        };
      }

      // Execute with retry
      const data = await this.executeWithRetry(serviceFn);

      // Cache the result
      this.setCachedData(cacheKey, data);

      return {
        data,
        loading: false,
      };
    } catch (error) {
      console.error(`AI Service Error [${cacheKey}]:`, error);
      return {
        error: error instanceof Error ? error : new Error(String(error)),
        loading: false,
      };
    }
  }

  // ==================== Recommendation Service ====================

  /**
   * Get personalized content recommendations
   */
  async getRecommendations(userId: string, limit: number = 10): Promise<ServiceResponse<any[]>> {
    const cacheKey = `recommendations:${userId}:${limit}`;
    return this.wrapServiceCall(cacheKey, async () => {
      // Use the existing recommendation service
      const recommendations = await recommendationService.getRecommendations(
        userId,
        'content' as any, // Type workaround
        limit
      );
      return recommendations;
    });
  }

  /**
   * Refresh recommendations (bypasses cache)
   */
  async refreshRecommendations(userId: string, limit: number = 10): Promise<ServiceResponse<any[]>> {
    const cacheKey = `recommendations:${userId}:${limit}`;
    this.clearCacheEntry(cacheKey);
    return this.getRecommendations(userId, limit);
  }

  /**
   * Dismiss a recommendation
   */
  async dismissRecommendation(userId: string, recommendationId: string): Promise<ServiceResponse<void>> {
    // Placeholder - implement when service supports it
    try {
      console.log(`Dismissing recommendation ${recommendationId} for user ${userId}`);
      return { loading: false };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error(String(error)),
        loading: false,
      };
    }
  }

  /**
   * Provide feedback on recommendation
   */
  async provideFeedback(
    userId: string,
    recommendationId: string,
    feedback: 'helpful' | 'not-helpful'
  ): Promise<ServiceResponse<void>> {
    // Placeholder - implement when service supports it
    try {
      console.log(`Feedback ${feedback} for recommendation ${recommendationId} from user ${userId}`);
      return { loading: false };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error(String(error)),
        loading: false,
      };
    }
  }

  // ==================== Analytics Service ====================

  /**
   * Get user analytics data
   */
  async getAnalytics(
    userId: string,
    timeRange: 'day' | 'week' | 'month' = 'week'
  ): Promise<ServiceResponse<any>> {
    const cacheKey = `analytics:${userId}:${timeRange}`;
    return this.wrapServiceCall(cacheKey, async () => {
      // Use existing analytics service methods
      const patterns = await analyticsService.analyzeLearningPatterns(userId);
      const recommendations = await analyticsService.getRecommendations(userId);
      return {
        patterns,
        recommendations,
        timeRange,
      };
    });
  }

  /**
   * Track user activity
   */
  async trackActivity(userId: string, activity: any): Promise<ServiceResponse<void>> {
    // Don't cache tracking calls
    try {
      await analyticsService.trackEvent(userId, activity.type || 'activity', activity);
      return { loading: false };
    } catch (error) {
      console.error('Analytics tracking error:', error);
      return {
        error: error instanceof Error ? error : new Error(String(error)),
        loading: false,
      };
    }
  }

  // ==================== Progress Service ====================

  /**
   * Get user progress data
   */
  async getProgress(userId: string, contentId?: string): Promise<ServiceResponse<any>> {
    const cacheKey = `progress:${userId}:${contentId || 'all'}`;
    return this.wrapServiceCall(cacheKey, async () => {
      if (contentId) {
        return progressService.getProgress(userId, contentId);
      } else {
        return progressService.getAllProgress(userId);
      }
    });
  }

  /**
   * Update user progress
   */
  async updateProgress(
    userId: string,
    contentId: string,
    language: string,
    progressData: {
      status: 'not_started' | 'in_progress' | 'completed';
      score?: number;
      timeSpent?: number;
    }
  ): Promise<ServiceResponse<void>> {
    const cacheKey = `progress:${userId}`;
    this.clearCacheEntry(cacheKey); // Invalidate cache
    
    try {
      await progressService.updateProgress(userId, contentId, language, progressData);
      return { loading: false };
    } catch (error) {
      console.error('Progress update error:', error);
      return {
        error: error instanceof Error ? error : new Error(String(error)),
        loading: false,
      };
    }
  }

  // ==================== Performance Prediction Model ====================

  /**
   * Get performance predictions
   */
  async getPredictions(userId: string, assessment?: any): Promise<ServiceResponse<any>> {
    const cacheKey = `predictions:${userId}:${assessment?.id || 'default'}`;
    return this.wrapServiceCall(cacheKey, async () => {
      if (assessment) {
        return performancePredictionModel.predictPerformance(userId, assessment);
      } else {
        // Get learning gaps as default prediction
        const gaps = await performancePredictionModel.identifyLearningGaps(userId);
        const recommendations = await performancePredictionModel.recommendDifficulty(userId);
        return {
          learningGaps: gaps,
          difficultyRecommendations: recommendations,
        };
      }
    });
  }

  /**
   * Get learning gaps
   */
  async getLearningGaps(userId: string): Promise<ServiceResponse<any[]>> {
    const cacheKey = `learning-gaps:${userId}`;
    return this.wrapServiceCall(cacheKey, async () => {
      return performancePredictionModel.identifyLearningGaps(userId);
    });
  }

  /**
   * Get difficulty recommendations
   */
  async getDifficultyRecommendations(userId: string): Promise<ServiceResponse<any[]>> {
    const cacheKey = `difficulty-rec:${userId}`;
    return this.wrapServiceCall(cacheKey, async () => {
      return performancePredictionModel.recommendDifficulty(userId);
    });
  }

  // ==================== Cultural Context Model ====================

  /**
   * Evaluate cultural appropriateness of content
   */
  async evaluateCulturalContent(
    content: string,
    language: 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn',
    targetAge: number
  ): Promise<ServiceResponse<any>> {
    const cacheKey = `cultural:${language}:${targetAge}:${content.substring(0, 50)}`;
    return this.wrapServiceCall(cacheKey, async () => {
      return culturalContextModel.evaluateContent(content, language, targetAge);
    });
  }

  /**
   * Evaluate festival content
   */
  async evaluateFestivalContent(
    content: string,
    festival: any
  ): Promise<ServiceResponse<any>> {
    const cacheKey = `festival:${festival.name}:${content.substring(0, 50)}`;
    return this.wrapServiceCall(cacheKey, async () => {
      return culturalContextModel.evaluateFestivalContent(content, festival);
    });
  }

  // ==================== Educational Content Model ====================

  /**
   * Classify educational content
   */
  async classifyContent(
    text: string,
    language: 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' = 'en'
  ): Promise<ServiceResponse<any>> {
    const cacheKey = `classify:${language}:${text.substring(0, 50)}`;
    return this.wrapServiceCall(cacheKey, async () => {
      return educationalContentModel.classifyContent(text, language);
    });
  }

  /**
   * Extract content metadata
   */
  async extractMetadata(
    content: string,
    language: 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' = 'en'
  ): Promise<ServiceResponse<any>> {
    const cacheKey = `metadata:${language}:${content.substring(0, 50)}`;
    return this.wrapServiceCall(cacheKey, async () => {
      return educationalContentModel.extractMetadata(content, language);
    });
  }

  // ==================== Content Recommender Model ====================

  /**
   * Get next content recommendations
   */
  async getNextContent(
    userId: string,
    currentContent: any,
    userHistory: any[]
  ): Promise<ServiceResponse<any[]>> {
    const cacheKey = `next-content:${userId}:${currentContent?.id || 'start'}`;
    return this.wrapServiceCall(cacheKey, async () => {
      return contentRecommenderModel.recommendNext(userId, currentContent, userHistory);
    });
  }

  /**
   * Get similar content recommendations
   */
  async getSimilarContent(
    content: any,
    count: number = 5
  ): Promise<ServiceResponse<any[]>> {
    const cacheKey = `similar-content:${content.id}:${count}`;
    return this.wrapServiceCall(cacheKey, async () => {
      return contentRecommenderModel.recommendSimilar(content, count);
    });
  }

  /**
   * Get difficulty-adjusted recommendations
   */
  async getDifficultyAdjustedContent(
    currentContent: any,
    performanceHistory: any[]
  ): Promise<ServiceResponse<any[]>> {
    const cacheKey = `difficulty-adjusted:${currentContent.id}`;
    return this.wrapServiceCall(cacheKey, async () => {
      return contentRecommenderModel.recommendDifficultyAdjusted(currentContent, performanceHistory);
    });
  }

  /**
   * Get exam preparation recommendations
   */
  async getExamPrepContent(
    exam: any,
    userHistory: any[],
    timeAvailable: number
  ): Promise<ServiceResponse<any[]>> {
    const cacheKey = `exam-prep:${exam.subject}:${timeAvailable}`;
    return this.wrapServiceCall(cacheKey, async () => {
      return contentRecommenderModel.recommendForExam(exam, userHistory, timeAvailable);
    });
  }

  /**
   * Get gap-filling recommendations
   */
  async getGapFillingContent(gaps: any[]): Promise<ServiceResponse<any[]>> {
    const cacheKey = `gap-filling:${gaps.map(g => g.topic.name).join(',')}`;
    return this.wrapServiceCall(cacheKey, async () => {
      return contentRecommenderModel.recommendForGaps(gaps);
    });
  }

  /**
   * Track content interaction
   */
  async trackContentInteraction(interaction: any): Promise<ServiceResponse<void>> {
    try {
      await contentRecommenderModel.updateWithInteraction(interaction);
      return { loading: false };
    } catch (error) {
      console.error('Content interaction tracking error:', error);
      return {
        error: error instanceof Error ? error : new Error(String(error)),
        loading: false,
      };
    }
  }

  // ==================== Batch Operations ====================

  /**
   * Fetch all user data in parallel
   */
  async fetchAllUserData(userId: string): Promise<{
    recommendations: ServiceResponse<any[]>;
    analytics: ServiceResponse<any>;
    progress: ServiceResponse<any>;
    predictions: ServiceResponse<any>;
  }> {
    const [recommendations, analytics, progress, predictions] = await Promise.all([
      this.getRecommendations(userId),
      this.getAnalytics(userId),
      this.getProgress(userId),
      this.getPredictions(userId),
    ]);

    return {
      recommendations,
      analytics,
      progress,
      predictions,
    };
  }

  /**
   * Refresh all user data (bypasses cache)
   */
  async refreshAllUserData(userId: string): Promise<{
    recommendations: ServiceResponse<any[]>;
    analytics: ServiceResponse<any>;
    progress: ServiceResponse<any>;
    predictions: ServiceResponse<any>;
  }> {
    // Clear all user-related cache
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));

    return this.fetchAllUserData(userId);
  }
}

// Export singleton instance
export const aiServiceFacade = new AIServiceFacade();

// Export class for testing
export { AIServiceFacade };
