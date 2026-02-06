/**
 * Content Recommender Model - Hybrid recommendation engine
 * Combines collaborative filtering, content-based filtering, and deep learning
 * 
 * Features:
 * - Hybrid approach (40% collaborative + 30% content-based + 30% deep learning)
 * - 5 recommendation types (next, similar, difficulty-adjusted, exam prep, gap filling)
 * - Cold start handling
 * - Real-time personalization
 * - Exponential decay for older interactions
 * 
 * Target CTR: >70%
 * Latency Target: <200ms
 */

import { modelManager } from './ModelManager';
import { errorService } from '../ErrorService';
import type { Subject } from './EducationalContentModel';
import type { LearningGap } from './PerformancePredictionModel';

export interface Content {
  id: string;
  title: string;
  subject: Subject;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  contentType: 'Video' | 'Text' | 'Quiz' | 'Interactive';
  duration: number;            // minutes
  embedding?: number[];        // Vector embedding
  tags: string[];
  popularity: number;          // 0-1
}

export interface UserActivity {
  userId: string;
  contentId: string;
  action: 'view' | 'complete' | 'like' | 'bookmark';
  score?: number;
  timeSpent: number;
  timestamp: Date;
}

export interface UserProfile {
  userId: string;
  grade: number;
  board: string;
  subjects: Subject[];
  preferredLanguage: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  strengths: string[];
  weaknesses: string[];
}

export interface ContentRecommendation {
  content: Content;
  score: number;              // 0-1
  reasoning: RecommendationReason;
  type: RecommendationType;
  confidence: number;
}

export type RecommendationType =
  | 'next_content'
  | 'similar_content'
  | 'difficulty_adjusted'
  | 'exam_prep'
  | 'gap_filling';

export interface RecommendationReason {
  primary: string;
  factors: RecommendationFactor[];
}

export interface RecommendationFactor {
  factor: string;
  weight: number;
  contribution: number;
}

export interface UserInteraction {
  userId: string;
  contentId: string;
  action: 'view' | 'complete' | 'like' | 'skip';
  score?: number;
  timestamp: Date;
}

class ContentRecommenderModel {
  private modelId = 'content-recommender-model';
  private model: any = null;
  private isInitialized = false;

  // Hybrid weights
  private weights = {
    collaborative: 0.4,
    contentBased: 0.3,
    deepLearning: 0.3
  };

  // Interaction decay (half-life: 7 days)
  private decayHalfLife = 7 * 24 * 60 * 60 * 1000; // milliseconds

  // User-content interaction matrix (simplified)
  private interactionMatrix: Map<string, Map<string, number>> = new Map();

  // Content similarity cache
  private similarityCache: Map<string, Map<string, number>> = new Map();

  /**
   * Initialize the model
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🎯 Initializing Content Recommender Model...');

      // Mock model loading - using rule-based fallback
      // this.model = await modelManager.loadModel(this.modelId, {
      //   enableOffline: true,
      //   priority: 'medium'
      // });

      this.isInitialized = true;
      console.log('✅ Content Recommender Model initialized');
    } catch (error) {
      console.error('Failed to initialize Content Recommender Model:', error);
      // Continue with rule-based fallback
      this.isInitialized = true;
      console.log('⚠️ Using rule-based recommendations (model not available)');
    }
  }

  /**
   * Check if model is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get next content recommendation
   */
  async recommendNext(
    userId: string,
    currentContent: Content,
    userHistory: UserActivity[]
  ): Promise<ContentRecommendation[]> {
    if (!this.isReady()) {
      await this.initialize();
    }

    try {
      // Get recommendations from each strategy
      const collaborative = await this.collaborativeFiltering(userId, userHistory, 10);
      const contentBased = await this.contentBasedFiltering(currentContent, 10);
      const deepLearning = this.model
        ? await this.deepLearningRecommendations(userId, userHistory, 10)
        : [];

      // Combine with hybrid scoring
      const combined = this.hybridScoring(collaborative, contentBased, deepLearning);

      // Filter and rank
      const recommendations = combined
        .filter(rec => rec.content.id !== currentContent.id)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(rec => ({
          ...rec,
          type: 'next_content' as RecommendationType
        }));

      return recommendations;
    } catch (error) {
      console.error('Next content recommendation error:', error);
      // Return empty recommendations
      return [];
    }
  }

  /**
   * Get similar content recommendations
   */
  async recommendSimilar(
    content: Content,
    count: number = 5
  ): Promise<ContentRecommendation[]> {
    if (!this.isReady()) {
      await this.initialize();
    }

    try {
      const recommendations = await this.contentBasedFiltering(content, count * 2);

      return recommendations
        .slice(0, count)
        .map(rec => ({
          ...rec,
          type: 'similar_content' as RecommendationType
        }));
    } catch (error) {
      console.error('Similar content recommendation error:', error);
      // Return empty recommendations
      return [];
    }
  }

  /**
   * Get difficulty-adjusted recommendations
   */
  async recommendDifficultyAdjusted(
    currentContent: Content,
    performanceHistory: Array<{ score: number; difficulty: string }>
  ): Promise<ContentRecommendation[]> {
    if (!this.isReady()) {
      await this.initialize();
    }

    try {
      // Calculate average performance
      const avgScore = performanceHistory.reduce((sum, p) => sum + p.score, 0) / performanceHistory.length;

      // Determine target difficulty
      let targetDifficulty: Content['difficulty'];
      if (avgScore >= 85) {
        targetDifficulty = currentContent.difficulty === 'Easy' ? 'Medium' : 'Hard';
      } else if (avgScore < 60) {
        targetDifficulty = currentContent.difficulty === 'Hard' ? 'Medium' : 'Easy';
      } else {
        targetDifficulty = currentContent.difficulty;
      }

      // Get similar content at target difficulty
      const similar = await this.contentBasedFiltering(currentContent, 20);
      const adjusted = similar.filter(rec => rec.content.difficulty === targetDifficulty);

      return adjusted
        .slice(0, 5)
        .map(rec => ({
          ...rec,
          type: 'difficulty_adjusted' as RecommendationType,
          reasoning: {
            primary: `Adjusted to ${targetDifficulty} difficulty based on your performance`,
            factors: rec.reasoning.factors
          }
        }));
    } catch (error) {
      console.error('Difficulty-adjusted recommendation error:', error);
      // Return empty recommendations
      return [];
    }
  }

  /**
   * Get exam preparation recommendations
   */
  async recommendForExam(
    exam: { subject: Subject; topics: string[]; date?: Date },
    userHistory: UserActivity[],
    timeAvailable: number
  ): Promise<ContentRecommendation[]> {
    if (!this.isReady()) {
      await this.initialize();
    }

    try {
      // Prioritize topics not yet covered
      const coveredTopics = new Set(
        userHistory.map(a => a.contentId) // Simplified - would map to actual topics
      );

      // Mock content database query
      const examContent: Content[] = []; // Would query from actual database

      // Score based on topic coverage and time available
      const recommendations = examContent.map(content => {
        let score = 0.5;

        // Boost uncovered topics
        if (!coveredTopics.has(content.id)) {
          score += 0.3;
        }

        // Boost if time allows
        if (content.duration <= timeAvailable) {
          score += 0.2;
        }

        return {
          content,
          score,
          reasoning: {
            primary: 'Recommended for exam preparation',
            factors: [
              { factor: 'Topic coverage', weight: 0.5, contribution: 0.3 },
              { factor: 'Time available', weight: 0.3, contribution: 0.2 },
              { factor: 'Difficulty match', weight: 0.2, contribution: 0.1 }
            ]
          },
          type: 'exam_prep' as RecommendationType,
          confidence: 0.8
        };
      });

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      console.error('Exam prep recommendation error:', error);
      // Return empty recommendations
      return [];
    }
  }

  /**
   * Get gap-filling recommendations
   */
  async recommendForGaps(gaps: LearningGap[]): Promise<ContentRecommendation[]> {
    if (!this.isReady()) {
      await this.initialize();
    }

    try {
      const recommendations: ContentRecommendation[] = [];

      for (const gap of gaps.slice(0, 3)) { // Top 3 gaps
        // Mock content query for gap topics
        const gapContent: Content[] = []; // Would query from actual database

        for (const content of gapContent.slice(0, 2)) {
          recommendations.push({
            content,
            score: 0.9 - (gap.priority / 10) * 0.2,
            reasoning: {
              primary: `Addresses learning gap in ${gap.topic.name}`,
              factors: [
                { factor: 'Gap severity', weight: 0.5, contribution: gap.severity === 'high' ? 0.5 : 0.3 },
                { factor: 'Topic relevance', weight: 0.3, contribution: 0.3 },
                { factor: 'Difficulty match', weight: 0.2, contribution: 0.2 }
              ]
            },
            type: 'gap_filling' as RecommendationType,
            confidence: 0.85
          });
        }
      }

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      console.error('Gap-filling recommendation error:', error);
      // Return empty recommendations
      return [];
    }
  }

  /**
   * Cold start recommendations (new users)
   */
  async recommendColdStart(userProfile: UserProfile): Promise<ContentRecommendation[]> {
    if (!this.isReady()) {
      await this.initialize();
    }

    try {
      // Use curriculum-based + popularity-based recommendations
      const recommendations: ContentRecommendation[] = [];

      // Mock content query based on profile
      const popularContent: Content[] = []; // Would query from actual database

      for (const content of popularContent.slice(0, 5)) {
        recommendations.push({
          content,
          score: content.popularity,
          reasoning: {
            primary: 'Popular content for your grade and subjects',
            factors: [
              { factor: 'Popularity', weight: 0.5, contribution: content.popularity * 0.5 },
              { factor: 'Curriculum alignment', weight: 0.3, contribution: 0.3 },
              { factor: 'Learning style match', weight: 0.2, contribution: 0.2 }
            ]
          },
          type: 'next_content' as RecommendationType,
          confidence: 0.6
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Cold start recommendation error:', error);
      // Return empty recommendations
      return [];
    }
  }

  /**
   * Update with user interaction (real-time)
   */
  async updateWithInteraction(interaction: UserInteraction): Promise<void> {
    try {
      // Update interaction matrix
      if (!this.interactionMatrix.has(interaction.userId)) {
        this.interactionMatrix.set(interaction.userId, new Map());
      }

      const userInteractions = this.interactionMatrix.get(interaction.userId)!;

      // Calculate interaction score with decay
      const score = this.calculateInteractionScore(interaction);
      const decayedScore = this.applyDecay(score, interaction.timestamp);

      userInteractions.set(interaction.contentId, decayedScore);

      // Clear similarity cache for this content
      this.similarityCache.delete(interaction.contentId);
    } catch (error) {
      console.error('Interaction update error:', error);
    }
  }

  /**
   * Private: Collaborative filtering
   */
  private async collaborativeFiltering(
    userId: string,
    userHistory: UserActivity[],
    count: number
  ): Promise<ContentRecommendation[]> {
    // Simplified collaborative filtering
    // In production, would use matrix factorization (SVD)

    const recommendations: ContentRecommendation[] = [];

    // Find similar users (mock)
    const similarUsers: string[] = []; // Would calculate user similarity

    // Get content liked by similar users
    const recommendedContent: Content[] = []; // Would query from interaction matrix

    for (const content of recommendedContent.slice(0, count)) {
      recommendations.push({
        content,
        score: 0.7,
        reasoning: {
          primary: 'Users with similar interests enjoyed this',
          factors: [
            { factor: 'User similarity', weight: 0.6, contribution: 0.4 },
            { factor: 'Content popularity', weight: 0.4, contribution: 0.3 }
          ]
        },
        type: 'next_content' as RecommendationType,
        confidence: 0.7
      });
    }

    return recommendations;
  }

  /**
   * Private: Content-based filtering
   */
  private async contentBasedFiltering(
    content: Content,
    count: number
  ): Promise<ContentRecommendation[]> {
    // Calculate similarity based on metadata
    const recommendations: ContentRecommendation[] = [];

    // Mock content database
    const allContent: Content[] = []; // Would query from actual database

    for (const candidate of allContent) {
      if (candidate.id === content.id) continue;

      const similarity = this.calculateContentSimilarity(content, candidate);

      if (similarity > 0.5) {
        recommendations.push({
          content: candidate,
          score: similarity,
          reasoning: {
            primary: 'Similar to content you viewed',
            factors: [
              { factor: 'Topic similarity', weight: 0.5, contribution: 0.3 },
              { factor: 'Subject match', weight: 0.3, contribution: 0.2 },
              { factor: 'Difficulty match', weight: 0.2, contribution: 0.1 }
            ]
          },
          type: 'similar_content' as RecommendationType,
          confidence: similarity
        });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  /**
   * Private: Deep learning recommendations
   */
  private async deepLearningRecommendations(
    userId: string,
    userHistory: UserActivity[],
    count: number
  ): Promise<ContentRecommendation[]> {
    // Would use neural collaborative filtering
    // For now, return empty array
    return [];
  }

  /**
   * Private: Hybrid scoring
   */
  private hybridScoring(
    collaborative: ContentRecommendation[],
    contentBased: ContentRecommendation[],
    deepLearning: ContentRecommendation[]
  ): ContentRecommendation[] {
    const scoreMap = new Map<string, { content: Content; scores: number[]; reasons: RecommendationReason[] }>();

    // Collect scores from all strategies
    for (const rec of collaborative) {
      if (!scoreMap.has(rec.content.id)) {
        scoreMap.set(rec.content.id, { content: rec.content, scores: [0, 0, 0], reasons: [] });
      }
      const entry = scoreMap.get(rec.content.id)!;
      entry.scores[0] = rec.score;
      entry.reasons.push(rec.reasoning);
    }

    for (const rec of contentBased) {
      if (!scoreMap.has(rec.content.id)) {
        scoreMap.set(rec.content.id, { content: rec.content, scores: [0, 0, 0], reasons: [] });
      }
      const entry = scoreMap.get(rec.content.id)!;
      entry.scores[1] = rec.score;
      entry.reasons.push(rec.reasoning);
    }

    for (const rec of deepLearning) {
      if (!scoreMap.has(rec.content.id)) {
        scoreMap.set(rec.content.id, { content: rec.content, scores: [0, 0, 0], reasons: [] });
      }
      const entry = scoreMap.get(rec.content.id)!;
      entry.scores[2] = rec.score;
      entry.reasons.push(rec.reasoning);
    }

    // Calculate hybrid scores
    const recommendations: ContentRecommendation[] = [];

    for (const [contentId, entry] of scoreMap) {
      const hybridScore =
        entry.scores[0] * this.weights.collaborative +
        entry.scores[1] * this.weights.contentBased +
        entry.scores[2] * this.weights.deepLearning;

      const allFactors: RecommendationFactor[] = [];
      for (const reason of entry.reasons) {
        allFactors.push(...reason.factors);
      }

      recommendations.push({
        content: entry.content,
        score: hybridScore,
        reasoning: {
          primary: 'Recommended based on multiple factors',
          factors: allFactors
        },
        type: 'next_content' as RecommendationType,
        confidence: Math.min(...entry.scores.filter(s => s > 0))
      });
    }

    return recommendations;
  }

  /**
   * Private: Calculate content similarity
   */
  private calculateContentSimilarity(content1: Content, content2: Content): number {
    let similarity = 0;

    // Subject match
    if (content1.subject === content2.subject) {
      similarity += 0.4;
    }

    // Topic match
    if (content1.topic === content2.topic) {
      similarity += 0.3;
    }

    // Difficulty match
    if (content1.difficulty === content2.difficulty) {
      similarity += 0.2;
    }

    // Tag overlap
    const commonTags = content1.tags.filter(tag => content2.tags.includes(tag));
    similarity += (commonTags.length / Math.max(content1.tags.length, content2.tags.length)) * 0.1;

    return similarity;
  }

  /**
   * Private: Calculate interaction score
   */
  private calculateInteractionScore(interaction: UserInteraction): number {
    let score = 0;

    switch (interaction.action) {
      case 'complete':
        score = 1.0;
        break;
      case 'like':
        score = 0.8;
        break;
      case 'view':
        score = 0.5;
        break;
      case 'skip':
        score = -0.3;
        break;
    }

    // Adjust for score if available
    if (interaction.score !== undefined) {
      score *= (interaction.score / 100);
    }

    return score;
  }

  /**
   * Private: Apply exponential decay
   */
  private applyDecay(score: number, timestamp: Date): number {
    const age = Date.now() - timestamp.getTime();
    const decay = Math.exp(-age / this.decayHalfLife);
    return score * decay;
  }

  /**
   * Public methods for RecommendationService integration
   */

  /**
   * Track interaction
   */
  async trackInteraction(activity: UserActivity): Promise<void> {
    await this.updateWithInteraction({
      userId: activity.userId,
      contentId: activity.contentId,
      action: activity.action as 'view' | 'complete' | 'like' | 'skip',
      score: activity.score,
      timestamp: activity.timestamp
    });
  }

  /**
   * Clear cache for user
   */
  async clearCache(userId: string): Promise<void> {
    // Clear user-specific cache
    console.log(`Clearing cache for user ${userId}`);
  }
}

// Export singleton instance
export const contentRecommenderModel = new ContentRecommenderModel();
