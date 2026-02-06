/**
 * AI Services - Central export for all AI-related services
 * 
 * This module provides access to:
 * - Model Manager: Central model lifecycle management
 * - Model Loader: Model downloading and loading
 * - Model Cache: Offline model storage
 * - Educational Content Model: Content classification and metadata extraction
 * - Performance Prediction Model: Student performance prediction
 * - Content Recommender Model: Personalized content recommendations
 * - Cultural Context Model: Cultural appropriateness verification
 * - Search Engine: Multi-language semantic search
 * - Recommender System: Hybrid recommendation engine
 */

// Import singletons for internal use
import { modelManager } from './ModelManager';
import { educationalContentModel } from './EducationalContentModel';
import { performancePredictionModel } from './PerformancePredictionModel';
import { contentRecommenderModel } from './ContentRecommenderModel';
import { culturalContextModel } from './CulturalContextModel';

// Core infrastructure
export { modelManager, type ModelMetadata, type ModelStatus, type ModelConfig } from './ModelManager';
export { ModelLoader, type LoadProgressCallback } from './ModelLoader';
export { ModelCache } from './ModelCache';

// AI Models
export { educationalContentModel } from './EducationalContentModel';
export type { 
  Language, 
  Board, 
  Subject, 
  Difficulty, 
  ContentClassification, 
  ContentMetadata 
} from './EducationalContentModel';

export { performancePredictionModel } from './PerformancePredictionModel';
export type {
  StudentActivity,
  Assessment,
  PerformancePrediction,
  LearningGap,
  DifficultyRecommendation
} from './PerformancePredictionModel';

export { contentRecommenderModel } from './ContentRecommenderModel';
export type {
  Content,
  UserActivity,
  UserProfile,
  ContentRecommendation,
  RecommendationType
} from './ContentRecommenderModel';

export { culturalContextModel } from './CulturalContextModel';
export type {
  CulturalEvaluation,
  CulturalIssue,
  IssueType,
  AgeRange,
  Festival
} from './CulturalContextModel';

// Search and Recommendations (to be implemented)
// export { searchEngine } from './SearchEngine';
// export { recommenderSystem } from './RecommenderSystem';

/**
 * Initialize all AI services
 * Call this once during app startup
 */
export async function initializeAIServices(): Promise<void> {
  console.log('🤖 Initializing AI Services...');
  
  try {
    // Initialize model manager
    await modelManager.initialize();
    
    // Initialize AI models
    await educationalContentModel.initialize();
    await performancePredictionModel.initialize();
    await contentRecommenderModel.initialize();
    await culturalContextModel.initialize();
    
    // Preload critical models (optional)
    // await modelManager.preloadModels(['educational-content-model']);
    
    console.log('✅ AI Services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize AI Services:', error);
    throw error;
  }
}

/**
 * Get AI services health status
 */
export function getAIServicesHealth(): {
  modelManager: ReturnType<typeof modelManager.getHealthStatus>;
  memoryUsage: ReturnType<typeof modelManager.getMemoryUsage>;
} {
  return {
    modelManager: modelManager.getHealthStatus(),
    memoryUsage: modelManager.getMemoryUsage()
  };
}

/**
 * Cleanup AI services
 * Call this when shutting down or switching users
 */
export async function cleanupAIServices(): Promise<void> {
  console.log('🧹 Cleaning up AI Services...');
  
  try {
    // Cleanup unused models
    await modelManager.cleanupUnusedModels();
    
    console.log('✅ AI Services cleaned up');
  } catch (error) {
    console.error('Failed to cleanup AI Services:', error);
  }
}
