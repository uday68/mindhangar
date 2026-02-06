/**
 * Backend Services Index
 * Central export point for all backend services
 */

// Core Services
export { contentService } from './ContentService';
export type { Content, VideoContent, QuizContent, NoteContent, NoteBlock, QuizQuestion } from './ContentService';

export { progressService } from './ProgressService';
export type { UserProgress, LearningStats, Achievement, StudySession } from './ProgressService';

export { notificationService } from './NotificationService';
export type { Notification, StudyReminder } from './NotificationService';

export { analyticsService } from './AnalyticsService';
export type { AnalyticsEvent, LearningPattern, UsageMetrics } from './AnalyticsService';

export { syncService } from './SyncService';
export type { SyncStatus, SyncConflict } from './SyncService';

// Utility Services
export { offlineSyncService } from './OfflineSyncService';
export { bandwidthOptimizer } from './BandwidthOptimizer';
export { languageEngine } from './LanguageEngine';
export { culturalFilter } from './CulturalFilter';
export { curriculumAdapter } from './CurriculumAdapter';
export { examPreparationService } from './ExamPreparationService';
export { recommendationService } from './RecommendationService';
export type { 
  EducationalBoard, 
  CompetitiveExam, 
  Subject, 
  Syllabus, 
  ExamMapping, 
  StudyPlan 
} from './CurriculumAdapter';
export type {
  ExamQuestion,
  MockTest,
  MockTestResult,
  StudyRecommendation,
  PerformanceAnalytics
} from './ExamPreparationService';

// Database
export { db, DatabaseManager, initializeDatabase } from '../db';

// Government Integration
export { governmentIntegrationService } from './GovernmentIntegrationService';
export type { GovernmentPlatform, DIKSHAContent, ProgressReport } from './GovernmentIntegrationService';

// Payment Service
export { paymentService } from './PaymentService';
export type { PaymentGateway, PricingTier, PaymentMethod, Transaction, Subscription } from './PaymentService';

// Multi-Role Service
export { multiRoleService } from './MultiRoleService';
export type { 
  UserRole, 
  RolePermissions, 
  StudentProfile, 
  ParentProfile, 
  TeacherProfile,
  ParentalControl,
  ActivityAlert,
  ProgressSummary
} from './MultiRoleService';

/**
 * Initialize all backend services
 */
export async function initializeBackendServices(userId: string): Promise<void> {
  console.log('🚀 Initializing backend services...');

  try {
    // Import services dynamically to avoid circular dependencies
    const { initializeDatabase } = await import('../db');
    const { offlineSyncService } = await import('./OfflineSyncService');
    const { syncService } = await import('./SyncService');
    const { analyticsService } = await import('./AnalyticsService');
    const { governmentIntegrationService } = await import('./GovernmentIntegrationService');
    const { paymentService } = await import('./PaymentService');

    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Initialize offline sync
    await offlineSyncService.init();
    console.log('✅ Offline sync initialized');

    // Initialize sync service
    await syncService.initialize(userId);
    console.log('✅ Sync service initialized');

    // Load analytics events
    analyticsService.loadEvents();
    console.log('✅ Analytics loaded');

    // Initialize government integration
    await governmentIntegrationService.initialize();
    console.log('✅ Government integration initialized');

    // Initialize payment service
    await paymentService.initialize();
    console.log('✅ Payment service initialized');

    // Initialize AI services
    const { initializeAIServices } = await import('./ai');
    await initializeAIServices();
    console.log('✅ AI services initialized');

    console.log('✅ All backend services initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing backend services:', error);
    throw error;
  }
}

/**
 * Cleanup all backend services
 */
export async function cleanupBackendServices(): Promise<void> {
  console.log('🧹 Cleaning up backend services...');

  try {
    const { offlineSyncService } = await import('./OfflineSyncService');
    const { syncService } = await import('./SyncService');
    const { cleanupAIServices } = await import('./ai');
    
    offlineSyncService.destroy();
    syncService.destroy();
    await cleanupAIServices();
    console.log('✅ Backend services cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up backend services:', error);
  }
}

// AI Services
export * from './ai';
export { initializeAIServices, cleanupAIServices, getAIServicesHealth } from './ai';
export type { ModelMetadata, ModelStatus, ModelConfig } from './ai';
