/**
 * Recommendation Service - Personalized content recommendations
 * Integrates Content Recommender Model with existing services
 * 
 * Features:
 * - Next content recommendations
 * - Similar content recommendations
 * - Difficulty-adjusted recommendations
 * - Exam preparation recommendations
 * - Gap-filling recommendations
 * - Real-time personalization
 */

import { contentRecommenderModel } from './ai/ContentRecommenderModel';
import { performancePredictionModel } from './ai/PerformancePredictionModel';
import { contentService } from './ContentService';
import type { 
  Content,
  ContentRecommendation,
  UserActivity, 
  UserProfile, 
  RecommendationType,
  LearningGap
} from './ai/ContentRecommenderModel';
import type { Subject } from './ai/EducationalContentModel';

class RecommendationService {
  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(
    userId: string,
    type: RecommendationType,
    limit: number = 10
  ): Promise<ContentRecommendation[]> {
    try {
      // Get user profile
      const profile = await this.getUserProfile(userId);
      
      // Get recommendations from AI model
      const recommendations = await contentRecommenderModel.getRecommendations(
        userId,
        limit,
        type,
        profile
      );

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Get next content recommendations
   */
  async getNextContent(userId: string, limit: number = 5): Promise<ContentRecommendation[]> {
    return this.getRecommendations(userId, 'next_content', limit);
  }

  /**
   * Get similar content recommendations
   */
  async getSimilarContent(
    userId: string,
    contentId: string,
    limit: number = 5
  ): Promise<ContentRecommendation[]> {
    try {
      const profile = await this.getUserProfile(userId);
      const recommendations = await contentRecommenderModel.getSimilarContent(
        contentId,
        limit,
        profile
      );
      return recommendations;
    } catch (error) {
      console.error('Error getting similar content:', error);
      return [];
    }
  }

  /**
   * Get difficulty-adjusted recommendations
   */
  async getDifficultyAdjustedContent(
    userId: string,
    limit: number = 5
  ): Promise<ContentRecommendation[]> {
    return this.getRecommendations(userId, 'difficulty_adjusted', limit);
  }

  /**
   * Get exam preparation recommendations
   */
  async getExamPrepContent(
    userId: string,
    subject: Subject,
    limit: number = 10
  ): Promise<ContentRecommendation[]> {
    try {
      const profile = await this.getUserProfile(userId);
      const recommendations = await contentRecommenderModel.getExamPrepRecommendations(
        userId,
        subject,
        limit
      );
      return recommendations;
    } catch (error) {
      console.error('Error getting exam prep content:', error);
      return [];
    }
  }

  /**
   * Get gap-filling recommendations based on learning gaps
   */
  async getGapFillingContent(userId: string, limit: number = 5): Promise<ContentRecommendation[]> {
    try {
      // Get learning gaps from performance prediction model
      const gaps = await performancePredictionModel.identifyLearningGaps(userId);
      
      if (gaps.length === 0) {
        // No gaps, return next content instead
        return this.getNextContent(userId, limit);
      }

      // Get recommendations for filling gaps
      const profile = await this.getUserProfile(userId);
      const recommendations = await contentRecommenderModel.getGapFillingRecommendations(
        userId,
        gaps,
        limit
      );

      return recommendations;
    } catch (error) {
      console.error('Error getting gap-filling content:', error);
      return [];
    }
  }

  /**
   * Track user interaction with content
   */
  async trackInteraction(
    userId: string,
    contentId: string,
    action: 'view' | 'complete' | 'like' | 'bookmark',
    score?: number,
    timeSpent?: number
  ): Promise<void> {
    try {
      const activity: UserActivity = {
        userId,
        contentId,
        action,
        score,
        timeSpent: timeSpent || 0,
        timestamp: new Date(),
      };

      await contentRecommenderModel.trackInteraction(activity);
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  /**
   * Get user profile for recommendations
   */
  private async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      // In a real implementation, this would fetch from database
      // For now, return a default profile
      return {
        userId,
        grade: 10,
        board: 'CBSE',
        subjects: ['Mathematics', 'Science', 'English'],
        preferredLanguage: 'en',
        learningStyle: 'visual',
        strengths: ['Algebra', 'Physics'],
        weaknesses: ['Geometry', 'Chemistry'],
        interests: ['Technology', 'Space'],
        goals: ['JEE Preparation', 'Board Exams'],
        averageStudyTime: 120, // minutes per day
        lastActive: new Date(),
        completedContent: [],
        performanceMetrics: {}
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Get personalized dashboard recommendations
   */
  async getDashboardRecommendations(userId: string): Promise<{
    nextContent: ContentRecommendation[];
    gapFilling: ContentRecommendation[];
    examPrep: ContentRecommendation[];
    trending: ContentRecommendation[];
  }> {
    try {
      const [nextContent, gapFilling, examPrep] = await Promise.all([
        this.getNextContent(userId, 3),
        this.getGapFillingContent(userId, 3),
        this.getExamPrepContent(userId, 'Mathematics', 3),
      ]);

      return {
        nextContent,
        gapFilling,
        examPrep,
        trending: [], // Would implement trending logic
      };
    } catch (error) {
      console.error('Error getting dashboard recommendations:', error);
      return {
        nextContent: [],
        gapFilling: [],
        examPrep: [],
        trending: [],
      };
    }
  }

  /**
   * Refresh recommendations for a user
   */
  async refreshRecommendations(userId: string): Promise<void> {
    try {
      // Clear cache and regenerate recommendations
      await contentRecommenderModel.clearCache(userId);
      
      // Pre-generate common recommendation types
      await Promise.all([
        this.getNextContent(userId, 10),
        this.getGapFillingContent(userId, 10),
        this.getDifficultyAdjustedContent(userId, 10),
      ]);

      console.log(`✅ Refreshed recommendations for user ${userId}`);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    }
  }

  /**
   * Get recommendation analytics
   */
  async getRecommendationAnalytics(userId: string): Promise<{
    totalRecommendations: number;
    clickThroughRate: number;
    completionRate: number;
    averageScore: number;
    topRecommendedTopics: string[];
  }> {
    try {
      // In a real implementation, this would fetch from analytics database
      return {
        totalRecommendations: 0,
        clickThroughRate: 0,
        completionRate: 0,
        averageScore: 0,
        topRecommendedTopics: [],
      };
    } catch (error) {
      console.error('Error getting recommendation analytics:', error);
      throw error;
    }
  }

  /**
   * Get recommendations based on user's recent activity
   */
  async getRecentActivityBasedRecommendations(
    userId: string,
    limit: number = 5
  ): Promise<ContentRecommendation[]> {
    try {
      const profile = await this.getUserProfile(userId);
      return await contentRecommenderModel.getRecentActivityRecommendations(
        userId,
        limit,
        profile
      );
    } catch (error) {
      console.error('Error getting recent activity recommendations:', error);
      return [];
    }
  }

  /**
   * Get personalized content feed
   */
  async getPersonalizedFeed(
    userId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    items: ContentRecommendation[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const recommendations = await this.getRecommendations(
        userId,
        'next_content',
        pageSize * page
      );
      
      const startIndex = (page - 1) * pageSize;
      const paginatedItems = recommendations.slice(startIndex, startIndex + pageSize);
      
      return {
        items: paginatedItems,
        total: recommendations.length,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error getting personalized feed:', error);
      return {
        items: [],
        total: 0,
        page,
        pageSize
      };
    }
  }

  /**
   * Acknowledge recommendation
   */
  async acknowledgeRecommendation(
    userId: string,
    recommendationId: string
  ): Promise<void> {
    try {
      await contentRecommenderModel.acknowledgeRecommendation(userId, recommendationId);
    } catch (error) {
      console.error('Error acknowledging recommendation:', error);
    }
  }

  /**
   * Dismiss recommendation
   */
  async dismissRecommendation(
    userId: string,
    recommendationId: string
  ): Promise<void> {
    try {
      await contentRecommenderModel.dismissRecommendation(userId, recommendationId);
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  }

  /**
   * Get recommendations by topic
   */
  async getRecommendationsByTopic(
    userId: string,
    topic: string,
    limit: number = 5
  ): Promise<ContentRecommendation[]> {
    try {
      const profile = await this.getUserProfile(userId);
      return await contentRecommenderModel.getRecommendationsByTopic(
        userId,
        topic,
        limit,
        profile
      );
    } catch (error) {
      console.error('Error getting recommendations by topic:', error);
      return [];
    }
  }

  /**
   * Get trending content
   */
  async getTrendingContent(
    subject?: Subject,
    limit: number = 10
  ): Promise<ContentRecommendation[]> {
    try {
      return await contentRecommenderModel.getTrendingContent(subject, limit);
    } catch (error) {
      console.error('Error getting trending content:', error);
      return [];
    }
  }

  /**
   * Get recommendations for group study
   */
  async getGroupStudyRecommendations(
    userIds: string[],
    limit: number = 10
  ): Promise<ContentRecommendation[]> {
    try {
      const profiles = await Promise.all(
        userIds.map(userId => this.getUserProfile(userId))
      );
      return await contentRecommenderModel.getGroupRecommendations(profiles, limit);
    } catch (error) {
      console.error('Error getting group study recommendations:', error);
      return [];
    }
  }

  /**
   * Batch track multiple interactions
   */
  async batchTrackInteractions(
    interactions: Array<{
      userId: string;
      contentId: string;
      action: 'view' | 'complete' | 'like' | 'bookmark';
      score?: number;
      timeSpent?: number;
    }>
  ): Promise<void> {
    try {
      const activities: UserActivity[] = interactions.map(interaction => ({
        ...interaction,
        timeSpent: interaction.timeSpent || 0,
        timestamp: new Date()
      }));
      
      await contentRecommenderModel.batchTrackInteractions(activities);
    } catch (error) {
      console.error('Error batch tracking interactions:', error);
    }
  }
}

export const recommendationService = new RecommendationService();