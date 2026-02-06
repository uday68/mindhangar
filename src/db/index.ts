import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Initialize SQLite database
const sqlite = new Database('mindhangar-bharat.db');

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database with cultural context data
export async function initializeDatabase() {
  try {
    // Insert default cultural contexts
    const { CULTURAL_CONTEXTS } = await import('@/src/types/localization');
    
    for (const [region, context] of Object.entries(CULTURAL_CONTEXTS)) {
      await db.insert(schema.culturalContexts).values({
        id: `cultural_context_${region}`,
        region,
        festivals: JSON.stringify(context.festivals),
        historicalFigures: JSON.stringify(context.historicalFigures),
        geographicalReferences: JSON.stringify(context.geographicalReferences),
        culturalValues: JSON.stringify(context.culturalValues),
        preferredColors: JSON.stringify(context.preferredColors),
        educationalTraditions: JSON.stringify(context.educationalTraditions),
        updatedAt: new Date()
      }).onConflictDoNothing();
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Database utility functions
export class DatabaseManager {
  static async getUserWithPreferences(userId: string) {
    return await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      with: {
        progress: true,
        offlineCache: true
      }
    });
  }

  static async getLocalizedContent(contentId: string, language: string) {
    return await db.query.content.findFirst({
      where: (content, { eq }) => eq(content.id, contentId),
      with: {
        translations: {
          where: (translations, { eq }) => eq(translations.language, language)
        }
      }
    });
  }

  static async cacheContentForOffline(userId: string, contentId: string, language: string, data: any, priority: number = 1) {
    const cachedData = Buffer.from(JSON.stringify(data));
    
    await db.insert(schema.offlineCache).values({
      id: `cache_${userId}_${contentId}_${language}`,
      userId,
      contentId,
      language,
      cachedData,
      priority,
      cacheSize: cachedData.length,
      cachedAt: new Date(),
      lastAccessedAt: new Date()
    }).onConflictDoUpdate({
      target: schema.offlineCache.id,
      set: {
        cachedData,
        cacheSize: cachedData.length,
        lastAccessedAt: new Date()
      }
    });
  }

  static async getOfflineContent(userId: string, language: string) {
    return await db.query.offlineCache.findMany({
      where: (cache, { eq, and }) => and(
        eq(cache.userId, userId),
        eq(cache.language, language)
      ),
      orderBy: (cache, { desc }) => [desc(cache.priority), desc(cache.lastAccessedAt)],
      with: {
        content: {
          with: {
            translations: {
              where: (translations, { eq }) => eq(translations.language, language)
            }
          }
        }
      }
    });
  }

  static async updateUserProgress(userId: string, contentId: string, language: string, progress: {
    status: 'not_started' | 'in_progress' | 'completed';
    score?: number;
    timeSpent?: number;
  }) {
    const progressId = `progress_${userId}_${contentId}`;
    
    await db.insert(schema.userProgress).values({
      id: progressId,
      userId,
      contentId,
      language,
      status: progress.status,
      score: progress.score,
      timeSpent: progress.timeSpent,
      completedAt: progress.status === 'completed' ? new Date() : null,
      createdAt: new Date()
    }).onConflictDoUpdate({
      target: schema.userProgress.id,
      set: {
        status: progress.status,
        score: progress.score,
        timeSpent: progress.timeSpent,
        completedAt: progress.status === 'completed' ? new Date() : null
      }
    });
  }

  static async cleanupOfflineCache(userId: string, maxSizeBytes: number = 100 * 1024 * 1024) { // 100MB default
    // Get current cache size
    const cacheItems = await db.query.offlineCache.findMany({
      where: (cache, { eq }) => eq(cache.userId, userId),
      orderBy: (cache, { asc, desc }) => [asc(cache.priority), asc(cache.lastAccessedAt)]
    });

    let totalSize = cacheItems.reduce((sum, item) => sum + item.cacheSize, 0);

    // Remove least important/least recently accessed items until under limit
    for (const item of cacheItems) {
      if (totalSize <= maxSizeBytes) break;
      
      await db.delete(schema.offlineCache).where(
        eq(schema.offlineCache.id, item.id)
      );
      
      totalSize -= item.cacheSize;
    }
  }
}

export default db;