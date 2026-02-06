/**
 * Model Manager - Central service for managing AI models
 * Handles model loading, caching, versioning, and lifecycle management
 * 
 * Features:
 * - Progressive model loading for faster startup
 * - IndexedDB caching for offline use
 * - Model versioning and updates
 * - Health monitoring and diagnostics
 * - Memory management and cleanup
 */

import { ModelLoader } from './ModelLoader';
import { ModelCache } from './ModelCache';
import { errorService } from '../ErrorService';

export interface ModelMetadata {
  modelId: string;
  modelName: string;
  version: string;
  size: number;              // bytes
  format: 'onnx' | 'tfjs';
  quantization: 'int8' | 'float16' | 'float32';
  accuracy: number;          // 0-1
  latency: number;           // milliseconds
  deploymentType: 'edge' | 'cloud' | 'hybrid';
  lastUpdated: Date;
  trainingDataset: string;
  checksum: string;
  url?: string;              // CDN URL for model download
}

export interface ModelStatus {
  modelId: string;
  isLoaded: boolean;
  isLoading: boolean;
  loadProgress: number;      // 0-1
  error?: string;
  lastUsed?: Date;
  memoryUsage?: number;      // bytes
}

export interface ModelConfig {
  modelId: string;
  autoLoad?: boolean;
  priority?: 'high' | 'medium' | 'low';
  maxCacheAge?: number;      // milliseconds
  enableOffline?: boolean;
}

class ModelManager {
  private models: Map<string, any> = new Map();
  private modelStatus: Map<string, ModelStatus> = new Map();
  private modelMetadata: Map<string, ModelMetadata> = new Map();
  private modelLoader: ModelLoader;
  private modelCache: ModelCache;
  private isInitialized = false;
  private loadingQueue: string[] = [];
  private maxConcurrentLoads = 2;

  constructor() {
    this.modelLoader = new ModelLoader();
    this.modelCache = new ModelCache();
  }

  /**
   * Initialize the model manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🤖 Initializing Model Manager...');

      // Initialize cache
      await this.modelCache.initialize();

      // Load model registry
      await this.loadModelRegistry();

      // Check for cached models
      await this.checkCachedModels();

      this.isInitialized = true;
      console.log('✅ Model Manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Model Manager:', error);
      throw errorService.handleAIError(error, 'model-manager');
    }
  }

  /**
   * Register a model with metadata
   */
  registerModel(metadata: ModelMetadata): void {
    this.modelMetadata.set(metadata.modelId, metadata);
    this.modelStatus.set(metadata.modelId, {
      modelId: metadata.modelId,
      isLoaded: false,
      isLoading: false,
      loadProgress: 0
    });
    console.log(`📝 Registered model: ${metadata.modelName} (${metadata.version})`);
  }

  /**
   * Load a model by ID
   */
  async loadModel(modelId: string, config?: ModelConfig): Promise<any> {
    const metadata = this.modelMetadata.get(modelId);
    if (!metadata) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Check if already loaded
    if (this.models.has(modelId)) {
      console.log(`✓ Model already loaded: ${metadata.modelName}`);
      return this.models.get(modelId);
    }

    // Check if already loading
    const status = this.modelStatus.get(modelId);
    if (status?.isLoading) {
      console.log(`⏳ Model already loading: ${metadata.modelName}`);
      return this.waitForModelLoad(modelId);
    }

    // Update status
    this.updateModelStatus(modelId, {
      isLoading: true,
      loadProgress: 0
    });

    try {
      console.log(`📥 Loading model: ${metadata.modelName} (${this.formatSize(metadata.size)})`);

      // Check cache first
      let model = await this.modelCache.get(modelId);

      if (!model) {
        // Download and load model
        model = await this.modelLoader.load(metadata, (progress) => {
          this.updateModelStatus(modelId, {
            loadProgress: progress
          });
        });

        // Cache the model if offline is enabled
        if (config?.enableOffline !== false) {
          await this.modelCache.set(modelId, model, metadata);
        }
      } else {
        console.log(`✓ Loaded from cache: ${metadata.modelName}`);
      }

      // Store in memory
      this.models.set(modelId, model);

      // Update status
      this.updateModelStatus(modelId, {
        isLoaded: true,
        isLoading: false,
        loadProgress: 1,
        lastUsed: new Date()
      });

      console.log(`✅ Model loaded: ${metadata.modelName}`);
      return model;
    } catch (error) {
      console.error(`❌ Failed to load model: ${metadata.modelName}`, error);
      this.updateModelStatus(modelId, {
        isLoading: false,
        loadProgress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Unload a model to free memory
   */
  async unloadModel(modelId: string): Promise<void> {
    const metadata = this.modelMetadata.get(modelId);
    if (!metadata) {
      throw new Error(`Model not found: ${modelId}`);
    }

    if (!this.models.has(modelId)) {
      console.log(`Model not loaded: ${metadata.modelName}`);
      return;
    }

    try {
      // Remove from memory
      this.models.delete(modelId);

      // Update status
      this.updateModelStatus(modelId, {
        isLoaded: false,
        lastUsed: new Date()
      });

      console.log(`🗑️ Unloaded model: ${metadata.modelName}`);
    } catch (error) {
      console.error(`Failed to unload model: ${metadata.modelName}`, error);
      throw error;
    }
  }

  /**
   * Get a loaded model
   */
  getModel(modelId: string): any {
    return this.models.get(modelId);
  }

  /**
   * Check if a model is loaded
   */
  isModelLoaded(modelId: string): boolean {
    return this.models.has(modelId);
  }

  /**
   * Get model status
   */
  getModelStatus(modelId: string): ModelStatus | undefined {
    return this.modelStatus.get(modelId);
  }

  /**
   * Get model metadata
   */
  getModelMetadata(modelId: string): ModelMetadata | undefined {
    return this.modelMetadata.get(modelId);
  }

  /**
   * Get all registered models
   */
  getAllModels(): ModelMetadata[] {
    return Array.from(this.modelMetadata.values());
  }

  /**
   * Get all loaded models
   */
  getLoadedModels(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Check for model updates
   */
  async checkForUpdates(): Promise<ModelMetadata[]> {
    try {
      // Fetch latest model registry from server
      const response = await fetch('/api/ai/models/registry');
      if (!response.ok) {
        throw new Error('Failed to fetch model registry');
      }

      const latestModels: ModelMetadata[] = await response.json();
      const updates: ModelMetadata[] = [];

      for (const latestModel of latestModels) {
        const currentModel = this.modelMetadata.get(latestModel.modelId);
        if (!currentModel || currentModel.version !== latestModel.version) {
          updates.push(latestModel);
        }
      }

      return updates;
    } catch (error) {
      console.error('Failed to check for model updates:', error);
      return [];
    }
  }

  /**
   * Update a model to the latest version
   */
  async updateModel(modelId: string): Promise<void> {
    const metadata = this.modelMetadata.get(modelId);
    if (!metadata) {
      throw new Error(`Model not found: ${modelId}`);
    }

    try {
      console.log(`🔄 Updating model: ${metadata.modelName}`);

      // Unload current model
      if (this.models.has(modelId)) {
        await this.unloadModel(modelId);
      }

      // Clear cache
      await this.modelCache.delete(modelId);

      // Fetch latest metadata
      const updates = await this.checkForUpdates();
      const latestMetadata = updates.find(m => m.modelId === modelId);

      if (latestMetadata) {
        // Update metadata
        this.modelMetadata.set(modelId, latestMetadata);

        // Load new version
        await this.loadModel(modelId);

        console.log(`✅ Model updated: ${latestMetadata.modelName} (${latestMetadata.version})`);
      }
    } catch (error) {
      console.error(`Failed to update model: ${metadata.modelName}`, error);
      throw error;
    }
  }

  /**
   * Preload models for faster access
   */
  async preloadModels(modelIds: string[]): Promise<void> {
    console.log(`📦 Preloading ${modelIds.length} models...`);

    const promises = modelIds.map(modelId => 
      this.loadModel(modelId).catch(error => {
        console.error(`Failed to preload model: ${modelId}`, error);
      })
    );

    await Promise.all(promises);
    console.log('✅ Preloading complete');
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsage(): { total: number; byModel: Map<string, number> } {
    let total = 0;
    const byModel = new Map<string, number>();

    for (const [modelId, model] of this.models) {
      const metadata = this.modelMetadata.get(modelId);
      if (metadata) {
        byModel.set(modelId, metadata.size);
        total += metadata.size;
      }
    }

    return { total, byModel };
  }

  /**
   * Clean up unused models to free memory
   */
  async cleanupUnusedModels(maxAge: number = 3600000): Promise<void> {
    const now = Date.now();
    const modelsToUnload: string[] = [];

    for (const [modelId, status] of this.modelStatus) {
      if (status.isLoaded && status.lastUsed) {
        const age = now - status.lastUsed.getTime();
        if (age > maxAge) {
          modelsToUnload.push(modelId);
        }
      }
    }

    if (modelsToUnload.length > 0) {
      console.log(`🧹 Cleaning up ${modelsToUnload.length} unused models...`);
      for (const modelId of modelsToUnload) {
        await this.unloadModel(modelId);
      }
    }
  }

  /**
   * Get health status of all models
   */
  getHealthStatus(): {
    healthy: number;
    loading: number;
    failed: number;
    total: number;
  } {
    let healthy = 0;
    let loading = 0;
    let failed = 0;

    for (const status of this.modelStatus.values()) {
      if (status.error) {
        failed++;
      } else if (status.isLoading) {
        loading++;
      } else if (status.isLoaded) {
        healthy++;
      }
    }

    return {
      healthy,
      loading,
      failed,
      total: this.modelStatus.size
    };
  }

  /**
   * Private helper methods
   */

  private async loadModelRegistry(): Promise<void> {
    // Load default model registry
    // In production, this would fetch from a server
    const defaultModels: ModelMetadata[] = [
      {
        modelId: 'educational-content-model',
        modelName: 'Educational Content Model',
        version: '1.0.0',
        size: 400 * 1024 * 1024, // 400MB
        format: 'onnx',
        quantization: 'int8',
        accuracy: 0.87,
        latency: 300,
        deploymentType: 'edge',
        lastUpdated: new Date(),
        trainingDataset: 'NCERT + DIKSHA',
        checksum: 'abc123',
        url: '/models/educational-content-model.onnx'
      },
      {
        modelId: 'performance-prediction-model',
        modelName: 'Performance Prediction Model',
        version: '1.0.0',
        size: 300 * 1024 * 1024, // 300MB
        format: 'onnx',
        quantization: 'int8',
        accuracy: 0.82,
        latency: 150,
        deploymentType: 'edge',
        lastUpdated: new Date(),
        trainingDataset: 'Student Activity Data',
        checksum: 'def456',
        url: '/models/performance-prediction-model.onnx'
      },
      {
        modelId: 'content-recommender-model',
        modelName: 'Content Recommender Model',
        version: '1.0.0',
        size: 450 * 1024 * 1024, // 450MB
        format: 'onnx',
        quantization: 'int8',
        accuracy: 0.75,
        latency: 180,
        deploymentType: 'hybrid',
        lastUpdated: new Date(),
        trainingDataset: 'User Interactions',
        checksum: 'ghi789',
        url: '/models/content-recommender-model.onnx'
      },
      {
        modelId: 'cultural-context-model',
        modelName: 'Cultural Context Model',
        version: '1.0.0',
        size: 350 * 1024 * 1024, // 350MB
        format: 'onnx',
        quantization: 'int8',
        accuracy: 0.92,
        latency: 250,
        deploymentType: 'edge',
        lastUpdated: new Date(),
        trainingDataset: 'Indian Cultural Content',
        checksum: 'jkl012',
        url: '/models/cultural-context-model.onnx'
      }
    ];

    for (const model of defaultModels) {
      this.registerModel(model);
    }
  }

  private async checkCachedModels(): Promise<void> {
    const cachedModelIds = await this.modelCache.getAllKeys();
    console.log(`📦 Found ${cachedModelIds.length} cached models`);
  }

  private updateModelStatus(modelId: string, updates: Partial<ModelStatus>): void {
    const current = this.modelStatus.get(modelId);
    if (current) {
      this.modelStatus.set(modelId, { ...current, ...updates });
    }
  }

  private async waitForModelLoad(modelId: string, timeout: number = 30000): Promise<any> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const status = this.modelStatus.get(modelId);

        if (status?.isLoaded) {
          clearInterval(checkInterval);
          resolve(this.models.get(modelId));
        } else if (status?.error) {
          clearInterval(checkInterval);
          reject(new Error(status.error));
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error('Model load timeout'));
        }
      }, 100);
    });
  }

  private formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  }
}

// Export singleton instance
export const modelManager = new ModelManager();
