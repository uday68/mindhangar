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
  UserActivity, 
  UserProfile, 
  Recommendation,
  RecommendationType 
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
  ): Promise<Recommendation[]> {
    try {
      // Get user profile
      const profile = await this.getUserProfile(userId);
      
      // Get recommendations from AI model
      const recommendations = await contentRecommenderModel.recommend(
        userId,
        type,
        limit,
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
  async getNextContent(userId: string, limit: number = 5): Promise<Recommendation[]> {
    return this.getRecommendations(userId, 'next_content', limit);
  }

  /**
   * Get similar content recommendations
   */
  async getSimilarContent(
    userId: string,
    contentId: string,
    limit: number = 5
  ): Promise<Recommendation[]> {
    try {
      const profile = await this.getUserProfile(userId);
      const recommendations = await contentRecommenderModel.recommendSimilar(
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
  ): Promise<Recommendation[]> {
    return this.getRecommendations(userId, 'difficulty_adjusted', limit);
  }

  /**
   * Get exam preparation recommendations
   */
  async getExamPrepContent(
    userId: string,
    subject: Subject,
    limit: number = 10
  ): Promise<Recommendation[]> {
    try {
      const profile = await this.getUserProfile(userId);
      const recommendations = await contentRecommenderModel.recommendForExam(
        userId,
        subject,
        limit,
        profile
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
  async getGapFillingContent(userId: string, limit: number = 5): Promise<Recommendation[]> {
    try {
      // Get learning gaps from performance prediction model
      const gaps = await performancePredictionModel.identifyLearningGaps(userId);
      
      if (gaps.length === 0) {
        // No gaps, return next content instead
        return this.getNextContent(userId, limit);
      }

      // Get recommendations for filling gaps
      const profile = await this.getUserProfile(userId);
      const recommendations = await contentRecommenderModel.recommendForGaps(
        userId,
        gaps,
        limit,
        profile
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
        studyTime: 120, // minutes per day
        lastActive: new Date(),
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
    nextContent: Recommendation[];
    gapFilling: Recommendation[];
    examPrep: Recommendation[];
    trending: Recommendation[];
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
}

export const recommendationService = new RecommendationService();
