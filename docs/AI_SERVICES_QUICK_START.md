# AI Services Quick Start Guide

**For Developers**: How to use the new AI services in MindHangar AI for Bharat

---

## Overview

The AI Services provide browser-based and cloud-based AI capabilities including:
- Educational content classification
- Student performance prediction
- Personalized content recommendations
- Cultural appropriateness verification
- Multi-language semantic search
- Hybrid recommendation engine

---

## Installation

Dependencies are already installed in `package.json`:
```json
{
  "@xenova/transformers": "^2.17.2",
  "idb": "^8.0.0"
}
```

---

## Quick Start

### 1. Initialize AI Services

Call this once during app startup (in `App.tsx` or similar):

```typescript
import { initializeAIServices } from './src/services';

// During app initialization
async function initializeApp() {
  try {
    // Initialize AI services
    await initializeAIServices();
    console.log('✅ AI Services ready');
  } catch (error) {
    console.error('Failed to initialize AI services:', error);
  }
}
```

### 2. Load a Model

```typescript
import { modelManager } from './src/services/ai';

// Load a specific model
async function loadEducationalModel() {
  try {
    const model = await modelManager.loadModel('educational-content-model', {
      enableOffline: true,  // Cache for offline use
      priority: 'high'      // Load with high priority
    });
    
    console.log('Model loaded:', model);
  } catch (error) {
    console.error('Failed to load model:', error);
  }
}
```

### 3. Check Model Status

```typescript
import { modelManager } from './src/services/ai';

// Check if a model is loaded
const isLoaded = modelManager.isModelLoaded('educational-content-model');

// Get model status
const status = modelManager.getModelStatus('educational-content-model');
console.log('Model status:', status);
// {
//   modelId: 'educational-content-model',
//   isLoaded: true,
//   isLoading: false,
//   loadProgress: 1,
//   lastUsed: Date
// }

// Get model metadata
const metadata = modelManager.getModelMetadata('educational-content-model');
console.log('Model metadata:', metadata);
// {
//   modelName: 'Educational Content Model',
//   version: '1.0.0',
//   size: 419430400, // bytes
//   accuracy: 0.87,
//   latency: 300 // ms
// }
```

### 4. Monitor Model Loading Progress

```typescript
import { modelManager } from './src/services/ai';

async function loadWithProgress() {
  const modelId = 'educational-content-model';
  
  // Start loading
  const loadPromise = modelManager.loadModel(modelId);
  
  // Monitor progress
  const checkProgress = setInterval(() => {
    const status = modelManager.getModelStatus(modelId);
    if (status) {
      console.log(`Loading: ${Math.round(status.loadProgress * 100)}%`);
      
      if (status.isLoaded) {
        clearInterval(checkProgress);
        console.log('✅ Model loaded!');
      }
    }
  }, 100);
  
  await loadPromise;
}
```

### 5. Preload Models

Preload models in the background for faster access:

```typescript
import { modelManager } from './src/services/ai';

// Preload multiple models
async function preloadCriticalModels() {
  await modelManager.preloadModels([
    'educational-content-model',
    'performance-prediction-model',
    'cultural-context-model'
  ]);
  
  console.log('✅ Critical models preloaded');
}
```

### 6. Memory Management

```typescript
import { modelManager } from './src/services/ai';

// Get memory usage
const usage = modelManager.getMemoryUsage();
console.log('Total memory:', usage.total / (1024 * 1024), 'MB');
console.log('By model:', usage.byModel);

// Unload a model to free memory
await modelManager.unloadModel('educational-content-model');

// Cleanup unused models (older than 1 hour)
await modelManager.cleanupUnusedModels(3600000);
```

### 7. Check for Model Updates

```typescript
import { modelManager } from './src/services/ai';

// Check for updates
const updates = await modelManager.checkForUpdates();
if (updates.length > 0) {
  console.log('Updates available:', updates);
  
  // Update a specific model
  await modelManager.updateModel('educational-content-model');
}
```

### 8. Health Monitoring

```typescript
import { getAIServicesHealth } from './src/services';

// Get overall health status
const health = getAIServicesHealth();
console.log('AI Services Health:', health);
// {
//   modelManager: {
//     healthy: 3,
//     loading: 1,
//     failed: 0,
//     total: 4
//   },
//   memoryUsage: {
//     total: 1200000000,
//     byModel: Map { ... }
//   }
// }
```

### 9. Cleanup on Shutdown

```typescript
import { cleanupAIServices } from './src/services';

// When user logs out or app closes
async function shutdown() {
  await cleanupAIServices();
  console.log('✅ AI Services cleaned up');
}
```

---

## Available Models

### 1. Educational Content Model
**ID**: `educational-content-model`  
**Size**: 400MB  
**Purpose**: Classify educational content (board, grade, subject, topic, difficulty)  
**Accuracy**: 87%  
**Latency**: 300ms

```typescript
// Usage (when implemented)
import { educationalContentModel } from './src/services/ai';

const classification = await educationalContentModel.classifyContent(
  'Photosynthesis is the process...',
  'en'
);
// {
//   board: 'CBSE',
//   grade: 10,
//   subject: 'Biology',
//   topic: 'Photosynthesis',
//   difficulty: 'Medium',
//   confidence: 0.92
// }
```

### 2. Performance Prediction Model
**ID**: `performance-prediction-model`  
**Size**: 300MB  
**Purpose**: Predict student performance and identify learning gaps  
**Accuracy**: 82%  
**Latency**: 150ms  
**Privacy**: Edge-only (no server calls)

```typescript
// Usage (when implemented)
import { performancePredictionModel } from './src/services/ai';

const prediction = await performancePredictionModel.predictPerformance(
  studentHistory,
  targetAssessment
);
// {
//   predictedScore: 78,
//   confidence: 0.85,
//   weakTopics: ['Algebra', 'Geometry'],
//   strongTopics: ['Arithmetic'],
//   recommendedStudyTime: 120 // minutes
// }
```

### 3. Content Recommender Model
**ID**: `content-recommender-model`  
**Size**: 450MB  
**Purpose**: Generate personalized content recommendations  
**CTR**: 75%  
**Latency**: 180ms

```typescript
// Usage (when implemented)
import { contentRecommenderModel } from './src/services/ai';

const recommendations = await contentRecommenderModel.recommendNext(
  userId,
  currentContent,
  userHistory
);
// [
//   {
//     content: { id: '123', title: 'Quadratic Equations', ... },
//     score: 0.92,
//     reasoning: { primary: 'Based on your recent progress', ... },
//     type: 'next_content'
//   },
//   ...
// ]
```

### 4. Cultural Context Model
**ID**: `cultural-context-model`  
**Size**: 350MB  
**Purpose**: Verify cultural appropriateness of content  
**Accuracy**: 92%  
**Latency**: 250ms

```typescript
// Usage (when implemented)
import { culturalContextModel } from './src/services/ai';

const evaluation = await culturalContextModel.evaluateContent(
  'Content text...',
  'hi',
  15 // target age
);
// {
//   isAppropriate: true,
//   confidence: 0.95,
//   issues: [],
//   ageSuitability: { min: 12, max: 18 },
//   recommendations: []
// }
```

---

## Cache Management

### Check Cache Status

```typescript
import { modelManager } from './src/services/ai';

// Get cache statistics
const cache = modelManager['modelCache']; // Access via manager
const stats = await cache.getStats();
console.log('Cache stats:', stats);
// {
//   totalModels: 3,
//   totalSize: 1150000000, // bytes
//   oldestCache: Date,
//   newestCache: Date
// }

// Check storage usage
const usage = await cache.getCacheUsage();
console.log('Storage usage:', usage);
// {
//   used: 1200000000,
//   quota: 10000000000,
//   percentage: 12
// }
```

### Clear Cache

```typescript
import { modelManager } from './src/services/ai';

const cache = modelManager['modelCache'];

// Clear old models (older than 30 days)
await cache.clearOld(30 * 24 * 60 * 60 * 1000);

// Clear least recently used models to reach target size
await cache.clearLRU(500 * 1024 * 1024); // 500MB target

// Clear all cached models
await cache.clearAll();
```

---

## Error Handling

```typescript
import { modelManager } from './src/services/ai';

async function safeLoadModel(modelId: string) {
  try {
    const model = await modelManager.loadModel(modelId);
    return model;
  } catch (error) {
    console.error('Failed to load model:', error);
    
    // Check if model exists
    const metadata = modelManager.getModelMetadata(modelId);
    if (!metadata) {
      console.error('Model not found:', modelId);
      return null;
    }
    
    // Check model status for details
    const status = modelManager.getModelStatus(modelId);
    if (status?.error) {
      console.error('Model error:', status.error);
    }
    
    // Fallback to cached version or alternative
    return null;
  }
}
```

---

## Best Practices

### 1. Lazy Loading
Load models only when needed:

```typescript
// ❌ Bad: Load all models at startup
await modelManager.preloadModels([
  'educational-content-model',
  'performance-prediction-model',
  'content-recommender-model',
  'cultural-context-model'
]);

// ✅ Good: Load models on demand
async function classifyContent(text: string) {
  // Load model only when classification is needed
  if (!modelManager.isModelLoaded('educational-content-model')) {
    await modelManager.loadModel('educational-content-model');
  }
  
  // Use model...
}
```

### 2. Progressive Enhancement
Provide fallbacks when models aren't available:

```typescript
async function getRecommendations(userId: string) {
  if (modelManager.isModelLoaded('content-recommender-model')) {
    // Use AI recommendations
    return await aiRecommendations(userId);
  } else {
    // Fallback to rule-based recommendations
    return await ruleBasedRecommendations(userId);
  }
}
```

### 3. Memory Management
Clean up unused models regularly:

```typescript
// Set up periodic cleanup (every 30 minutes)
setInterval(async () => {
  await modelManager.cleanupUnusedModels(1800000); // 30 minutes
}, 1800000);
```

### 4. Offline Support
Always enable offline caching for critical models:

```typescript
await modelManager.loadModel('educational-content-model', {
  enableOffline: true  // Cache for offline use
});
```

### 5. Error Recovery
Implement retry logic for failed loads:

```typescript
async function loadModelWithRetry(modelId: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await modelManager.loadModel(modelId);
    } catch (error) {
      console.error(`Load attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## React Integration

### Custom Hook for Model Loading

```typescript
import { useState, useEffect } from 'react';
import { modelManager } from './src/services/ai';

export function useAIModel(modelId: string) {
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadModel() {
      try {
        setLoading(true);
        setError(null);

        // Monitor progress
        const interval = setInterval(() => {
          const status = modelManager.getModelStatus(modelId);
          if (status && mounted) {
            setProgress(status.loadProgress);
          }
        }, 100);

        const loadedModel = await modelManager.loadModel(modelId);

        clearInterval(interval);

        if (mounted) {
          setModel(loadedModel);
          setProgress(1);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load model');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadModel();

    return () => {
      mounted = false;
    };
  }, [modelId]);

  return { model, loading, error, progress };
}

// Usage in component
function MyComponent() {
  const { model, loading, error, progress } = useAIModel('educational-content-model');

  if (loading) {
    return <div>Loading model... {Math.round(progress * 100)}%</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Model ready!</div>;
}
```

---

## Troubleshooting

### Model Won't Load
1. Check if model is registered: `modelManager.getModelMetadata(modelId)`
2. Check model status: `modelManager.getModelStatus(modelId)`
3. Check browser console for errors
4. Verify internet connection (for first load)
5. Check storage quota: `cache.getCacheUsage()`

### Slow Loading
1. Enable offline caching: `enableOffline: true`
2. Preload models during idle time
3. Use progressive loading
4. Check network speed
5. Consider using smaller quantized models

### Out of Memory
1. Unload unused models: `modelManager.unloadModel(modelId)`
2. Enable automatic cleanup: `modelManager.cleanupUnusedModels()`
3. Clear old cache: `cache.clearOld()`
4. Use LRU eviction: `cache.clearLRU(targetSize)`

### Cache Issues
1. Clear cache: `cache.clearAll()`
2. Check storage quota: `cache.getCacheUsage()`
3. Verify IndexedDB is enabled in browser
4. Check for storage permission issues

---

## API Reference

See individual service files for detailed API documentation:
- `src/services/ai/ModelManager.ts`
- `src/services/ai/ModelLoader.ts`
- `src/services/ai/ModelCache.ts`

---

## Support

For issues or questions:
1. Check this guide
2. Review service source code
3. Check browser console for errors
4. Contact the AI team

---

**Last Updated**: February 6, 2026  
**Version**: 1.0.0
