/**
 * Model Cache - Manages offline storage of AI models in IndexedDB
 * Provides persistent caching for faster subsequent loads
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { ModelMetadata } from './ModelManager';

const DB_NAME = 'mindhangar-ai-models';
const DB_VERSION = 1;
const STORE_NAME = 'models';

interface CachedModel {
  modelId: string;
  model: any;
  metadata: ModelMetadata;
  cachedAt: Date;
  lastAccessed: Date;
  accessCount: number;
}

export class ModelCache {
  private db: IDBPDatabase | null = null;
  private isInitialized = false;

  /**
   * Initialize the cache database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create object store for models
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'modelId' });
            store.createIndex('cachedAt', 'cachedAt');
            store.createIndex('lastAccessed', 'lastAccessed');
            store.createIndex('accessCount', 'accessCount');
          }
        }
      });

      this.isInitialized = true;
      console.log('✅ Model cache initialized');
    } catch (error) {
      console.error('Failed to initialize model cache:', error);
      throw error;
    }
  }

  /**
   * Get a model from cache
   */
  async get(modelId: string): Promise<any | null> {
    if (!this.db) {
      throw new Error('Cache not initialized');
    }

    try {
      const cached = await this.db.get(STORE_NAME, modelId) as CachedModel | undefined;

      if (!cached) {
        return null;
      }

      // Update access statistics
      cached.lastAccessed = new Date();
      cached.accessCount++;
      await this.db.put(STORE_NAME, cached);

      console.log(`📦 Retrieved from cache: ${cached.metadata.modelName}`);
      return cached.model;
    } catch (error) {
      console.error(`Failed to get model from cache: ${modelId}`, error);
      return null;
    }
  }

  /**
   * Store a model in cache
   */
  async set(modelId: string, model: any, metadata: ModelMetadata): Promise<void> {
    if (!this.db) {
      throw new Error('Cache not initialized');
    }

    try {
      const cached: CachedModel = {
        modelId,
        model,
        metadata,
        cachedAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 0
      };

      await this.db.put(STORE_NAME, cached);
      console.log(`💾 Cached model: ${metadata.modelName} (${this.formatSize(metadata.size)})`);
    } catch (error) {
      console.error(`Failed to cache model: ${modelId}`, error);
      // Don't throw - caching is optional
    }
  }

  /**
   * Delete a model from cache
   */
  async delete(modelId: string): Promise<void> {
    if (!this.db) {
      throw new Error('Cache not initialized');
    }

    try {
      await this.db.delete(STORE_NAME, modelId);
      console.log(`🗑️ Deleted from cache: ${modelId}`);
    } catch (error) {
      console.error(`Failed to delete model from cache: ${modelId}`, error);
    }
  }

  /**
   * Check if a model is cached
   */
  async has(modelId: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('Cache not initialized');
    }

    try {
      const cached = await this.db.get(STORE_NAME, modelId);
      return cached !== undefined;
    } catch (error) {
      console.error(`Failed to check cache: ${modelId}`, error);
      return false;
    }
  }

  /**
   * Get all cached model IDs
   */
  async getAllKeys(): Promise<string[]> {
    if (!this.db) {
      throw new Error('Cache not initialized');
    }

    try {
      return await this.db.getAllKeys(STORE_NAME) as string[];
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalModels: number;
    totalSize: number;
    oldestCache: Date | null;
    newestCache: Date | null;
  }> {
    if (!this.db) {
      throw new Error('Cache not initialized');
    }

    try {
      const allModels = await this.db.getAll(STORE_NAME) as CachedModel[];

      let totalSize = 0;
      let oldestCache: Date | null = null;
      let newestCache: Date | null = null;

      for (const cached of allModels) {
        totalSize += cached.metadata.size;

        if (!oldestCache || cached.cachedAt < oldestCache) {
          oldestCache = cached.cachedAt;
        }

        if (!newestCache || cached.cachedAt > newestCache) {
          newestCache = cached.cachedAt;
        }
      }

      return {
        totalModels: allModels.length,
        totalSize,
        oldestCache,
        newestCache
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalModels: 0,
        totalSize: 0,
        oldestCache: null,
        newestCache: null
      };
    }
  }

  /**
   * Clear old cached models
   */
  async clearOld(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    if (!this.db) {
      throw new Error('Cache not initialized');
    }

    try {
      const allModels = await this.db.getAll(STORE_NAME) as CachedModel[];
      const now = Date.now();
      let cleared = 0;

      for (const cached of allModels) {
        const age = now - cached.cachedAt.getTime();
        if (age > maxAge) {
          await this.db.delete(STORE_NAME, cached.modelId);
          cleared++;
        }
      }

      if (cleared > 0) {
        console.log(`🧹 Cleared ${cleared} old cached models`);
      }

      return cleared;
    } catch (error) {
      console.error('Failed to clear old cache:', error);
      return 0;
    }
  }

  /**
   * Clear least recently used models to free space
   */
  async clearLRU(targetSize: number): Promise<number> {
    if (!this.db) {
      throw new Error('Cache not initialized');
    }

    try {
      const allModels = await this.db.getAll(STORE_NAME) as CachedModel[];
      const stats = await this.getStats();

      if (stats.totalSize <= targetSize) {
        return 0; // No need to clear
      }

      // Sort by last accessed (oldest first)
      allModels.sort((a, b) => 
        a.lastAccessed.getTime() - b.lastAccessed.getTime()
      );

      let currentSize = stats.totalSize;
      let cleared = 0;

      for (const cached of allModels) {
        if (currentSize <= targetSize) {
          break;
        }

        await this.db.delete(STORE_NAME, cached.modelId);
        currentSize -= cached.metadata.size;
        cleared++;
      }

      if (cleared > 0) {
        console.log(`🧹 Cleared ${cleared} LRU cached models`);
      }

      return cleared;
    } catch (error) {
      console.error('Failed to clear LRU cache:', error);
      return 0;
    }
  }

  /**
   * Clear all cached models
   */
  async clearAll(): Promise<void> {
    if (!this.db) {
      throw new Error('Cache not initialized');
    }

    try {
      await this.db.clear(STORE_NAME);
      console.log('🧹 Cleared all cached models');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache usage as percentage of quota
   */
  async getCacheUsage(): Promise<{
    used: number;
    quota: number;
    percentage: number;
  }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? (used / quota) * 100 : 0;

        return { used, quota, percentage };
      }

      return { used: 0, quota: 0, percentage: 0 };
    } catch (error) {
      console.error('Failed to get cache usage:', error);
      return { used: 0, quota: 0, percentage: 0 };
    }
  }

  /**
   * Private helper methods
   */

  private formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  }
}
