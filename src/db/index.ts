/**
 * Database Layer - Browser-compatible using IndexedDB
 * Replaces better-sqlite3 for browser environments
 */

import { initializeBrowserDB, getBrowserDB, get, put, remove, getAll, getByIndex, STORES } from './browserDB';
import * as schema from './schema';
import { errorService, ErrorCode } from '../services/ErrorService';

// Re-export browser DB functions
export { initializeBrowserDB as initializeDB, getBrowserDB as getDB };

// Mock db object for compatibility
export const db = {
  query: {
    users: {
      findFirst: async (options: any) => {
        const users = await getAll(STORES.users);
        return users[0]; // Simplified - would need proper filtering
      },
      findMany: async (options: any) => {
        return await getAll(STORES.users);
      }
    },
    content: {
      findFirst: async (options: any) => {
        const content = await getAll(STORES.content);
        return content[0]; // Simplified
      },
      findMany: async (options: any) => {
        return await getAll(STORES.content);
      }
    },
    offlineCache: {
      findMany: async (options: any) => {
        return await getAll(STORES.offlineCache);
      }
    }
  },
  insert: (storeName: string) => ({
    values: async (data: any) => ({
      returning: async () => {
        await put(storeName, data);
        return [data];
      },
      onConflictDoUpdate: () => ({})
    })
  }),
  update: (storeName: string) => ({
    set: (data: any) => ({
      where: async () => ({
        returning: async () => {
          await put(storeName, data);
          return [data];
        }
      })
    })
  }),
  delete: (storeName: string) => ({
    where: async () => {
      // Simplified delete
    }
  })
};

// Initialize database with cultural context data
export async function initializeDatabase() {
  try {
    await initializeBrowserDB();
    
    // Insert default cultural contexts
    const { CULTURAL_CONTEXTS } = await import('@/src/types/localization');
    
    for (const [region, context] of Object.entries(CULTURAL_CONTEXTS)) {
      await put(STORES.culturalContexts, {
        id: `cultural_context_${region}`,
        region,
        festivals: JSON.stringify(context.festivals),
        historicalFigures: JSON.stringify(context.historicalFigures),
        geographicalReferences: JSON.stringify(context.geographicalReferences),
        culturalValues: JSON.stringify(context.culturalValues),
        preferredColors: JSON.stringify(context.preferredColors),
        educationalTraditions: JSON.stringify(context.educationalTraditions),
        updatedAt: new Date()
      });
    }
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Database utility functions
export class DatabaseManager {
  static async getUserWithPreferences(userId: string) {
    const user = await get<any>(STORES.users, userId);
    if (!user) return null;
    
    // Get related data
    const progress = await getByIndex<any>(STORES.userProgress, 'userId', userId);
    const offlineCache = await getByIndex<any>(STORES.offlineCache, 'userId', userId);
    
    return {
      ...(user as object),
      progress,
      offlineCache
    };
  }

  static async getLocalizedContent(contentId: string, language: string) {
    const content = await get<any>(STORES.content, contentId);
    if (!content) return null;
    
    const translations = await getByIndex<any>(STORES.contentTranslations, 'contentId', contentId);
    const translation = translations.find((t: any) => t.language === language);
    
    return {
      ...(content as object),
      translations: translation ? [translation] : []
    };
  }

  static async cacheContentForOffline(
    userId: string,
    contentId: string,
    language: string,
    data: any,
    priority: number = 1
  ) {
    const cacheId = `cache_${userId}_${contentId}_${language}`;
    const cachedData = JSON.stringify(data);
    
    await put(STORES.offlineCache, {
      id: cacheId,
      userId,
      contentId,
      language,
      cachedData,
      priority,
      cacheSize: cachedData.length,
      cachedAt: new Date(),
      lastAccessedAt: new Date()
    });
  }

  static async getOfflineContent(userId: string, language: string) {
    const allCache = await getByIndex(STORES.offlineCache, 'userId', userId);
    return allCache
      .filter((cache: any) => cache.language === language)
      .sort((a: any, b: any) => b.priority - a.priority || b.lastAccessedAt - a.lastAccessedAt);
  }

  static async updateUserProgress(
    userId: string,
    contentId: string,
    language: string,
    progress: {
      status: 'not_started' | 'in_progress' | 'completed';
      score?: number;
      timeSpent?: number;
    }
  ) {
    const progressId = `progress_${userId}_${contentId}`;
    
    await put(STORES.userProgress, {
      id: progressId,
      userId,
      contentId,
      language,
      status: progress.status,
      score: progress.score,
      timeSpent: progress.timeSpent,
      completedAt: progress.status === 'completed' ? new Date() : null,
      createdAt: new Date()
    });
  }

  static async cleanupOfflineCache(userId: string, maxSizeBytes: number = 100 * 1024 * 1024) {
    const cacheItems = await getByIndex<any>(STORES.offlineCache, 'userId', userId);
    
    // Sort by priority and last accessed
    const sorted = cacheItems.sort((a: any, b: any) => 
      a.priority - b.priority || a.lastAccessedAt - b.lastAccessedAt
    );

    let totalSize = sorted.reduce((sum: number, item: any) => sum + (item.cacheSize || 0), 0);

    // Remove least important items until under limit
    for (const item of sorted) {
      if (totalSize <= maxSizeBytes) break;
      
      await remove(STORES.offlineCache, item.id);
      totalSize -= (item.cacheSize || 0);
    }
  }
}

export default db;