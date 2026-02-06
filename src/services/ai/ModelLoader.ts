/**
 * Model Loader - Handles downloading and loading AI models
 * Supports progressive loading, retry logic, and bandwidth optimization
 */

import type { ModelMetadata } from './ModelManager';
import { errorService } from '../ErrorService';

export type LoadProgressCallback = (progress: number) => void;

export class ModelLoader {
  private loadingModels: Map<string, Promise<any>> = new Map();

  /**
   * Load a model from URL or cache
   */
  async load(
    metadata: ModelMetadata,
    onProgress?: LoadProgressCallback
  ): Promise<any> {
    // Check if already loading
    if (this.loadingModels.has(metadata.modelId)) {
      return this.loadingModels.get(metadata.modelId)!;
    }

    const loadPromise = this.loadInternal(metadata, onProgress);
    this.loadingModels.set(metadata.modelId, loadPromise);

    try {
      const model = await loadPromise;
      return model;
    } finally {
      this.loadingModels.delete(metadata.modelId);
    }
  }

  /**
   * Internal load implementation
   */
  private async loadInternal(
    metadata: ModelMetadata,
    onProgress?: LoadProgressCallback
  ): Promise<any> {
    try {
      if (metadata.format === 'onnx') {
        return await this.loadONNXModel(metadata, onProgress);
      } else if (metadata.format === 'tfjs') {
        return await this.loadTFJSModel(metadata, onProgress);
      } else {
        throw new Error(`Unsupported model format: ${metadata.format}`);
      }
    } catch (error) {
      console.error(`Failed to load model: ${metadata.modelName}`, error);
      throw errorService.handleAIError(error, 'model-loader');
    }
  }

  /**
   * Load ONNX model using Transformers.js
   */
  private async loadONNXModel(
    metadata: ModelMetadata,
    onProgress?: LoadProgressCallback
  ): Promise<any> {
    try {
      // Dynamic import of Transformers.js
      const { pipeline } = await import('@xenova/transformers');

      // Determine pipeline type based on model name
      const pipelineType = this.getPipelineType(metadata.modelName);

      // Load model with progress tracking
      const model = await pipeline(pipelineType, metadata.url || metadata.modelId, {
        progress_callback: (progress: any) => {
          if (progress.status === 'progress' && onProgress) {
            onProgress(progress.progress || 0);
          }
        }
      });

      return model;
    } catch (error) {
      console.error('Failed to load ONNX model:', error);
      throw error;
    }
  }

  /**
   * Load TensorFlow.js model
   */
  private async loadTFJSModel(
    metadata: ModelMetadata,
    onProgress?: LoadProgressCallback
  ): Promise<any> {
    try {
      // This would use TensorFlow.js if needed
      // For now, we're focusing on Transformers.js
      throw new Error('TensorFlow.js models not yet supported');
    } catch (error) {
      console.error('Failed to load TFJS model:', error);
      throw error;
    }
  }

  /**
   * Download model file with progress tracking
   */
  private async downloadWithProgress(
    url: string,
    onProgress?: LoadProgressCallback
  ): Promise<ArrayBuffer> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download model: ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    if (!contentLength) {
      // No content length, just download without progress
      return await response.arrayBuffer();
    }

    const total = parseInt(contentLength, 10);
    let loaded = 0;

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      loaded += value.length;

      if (onProgress) {
        onProgress(loaded / total);
      }
    }

    // Combine chunks
    const combined = new Uint8Array(loaded);
    let position = 0;
    for (const chunk of chunks) {
      combined.set(chunk, position);
      position += chunk.length;
    }

    return combined.buffer;
  }

  /**
   * Get pipeline type from model name
   */
  private getPipelineType(modelName: string): string {
    const name = modelName.toLowerCase();

    if (name.includes('text-generation') || name.includes('gpt')) {
      return 'text-generation';
    } else if (name.includes('question-answering') || name.includes('qa')) {
      return 'question-answering';
    } else if (name.includes('classification') || name.includes('bert')) {
      return 'text-classification';
    } else if (name.includes('embedding')) {
      return 'feature-extraction';
    } else if (name.includes('translation')) {
      return 'translation';
    } else {
      // Default to feature extraction for custom models
      return 'feature-extraction';
    }
  }

  /**
   * Verify model checksum
   */
  private async verifyChecksum(data: ArrayBuffer, expectedChecksum: string): Promise<boolean> {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex === expectedChecksum;
    } catch (error) {
      console.error('Failed to verify checksum:', error);
      return false;
    }
  }
}
