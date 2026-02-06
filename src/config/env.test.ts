import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock environment variables
const mockEnv = {
  VITE_GEMINI_API_KEY: 'test-gemini-key',
  VITE_GOOGLE_CLIENT_ID: 'test-google-client',
  VITE_GITHUB_CLIENT_ID: 'test-github-client',
  VITE_SEARCH_API_KEY: 'test-search-key',
  VITE_SEARCH_ENGINE_ID: 'test-engine-id',
  VITE_TRANSLATE_API_KEY: 'test-translate-key',
  VITE_STRIPE_PUBLIC_KEY: 'test-stripe-key',
  VITE_RAZORPAY_KEY_ID: 'test-razorpay-key',
  VITE_SENTRY_DSN: 'test-sentry-dsn',
  VITE_ANALYTICS_ID: 'test-analytics-id',
  MODE: 'development',
  DEV: true,
  PROD: false
};

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: mockEnv
  }
});

describe('Environment Configuration', () => {
  let env: any;

  beforeEach(async () => {
    // Reset modules to get fresh env
    vi.resetModules();
    
    // Re-import env module
    const envModule = await import('./env');
    env = envModule.env;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('API Keys', () => {
    it('should load Gemini API key', () => {
      expect(env.geminiApiKey).toBe('test-gemini-key');
    });

    it('should load Google Client ID', () => {
      expect(env.googleClientId).toBe('test-google-client');
    });

    it('should load GitHub Client ID', () => {
      expect(env.githubClientId).toBe('test-github-client');
    });

    it('should load Search API key', () => {
      expect(env.searchApiKey).toBe('test-search-key');
    });

    it('should load Search Engine ID', () => {
      expect(env.searchEngineId).toBe('test-engine-id');
    });

    it('should load Translate API key', () => {
      expect(env.translateApiKey).toBe('test-translate-key');
    });

    it('should load Stripe public key', () => {
      expect(env.stripePublicKey).toBe('test-stripe-key');
    });

    it('should load Razorpay key ID', () => {
      expect(env.razorpayKeyId).toBe('test-razorpay-key');
    });
  });

  describe('Monitoring', () => {
    it('should load Sentry DSN', () => {
      expect(env.sentryDsn).toBe('test-sentry-dsn');
    });

    it('should load Analytics ID', () => {
      expect(env.analyticsId).toBe('test-analytics-id');
    });
  });

  describe('Environment Detection', () => {
    it('should detect development mode', () => {
      expect(env.isDevelopment).toBe(true);
    });

    it('should detect production mode', () => {
      expect(env.isProduction).toBe(false);
    });

    it('should provide mode string', () => {
      expect(env.mode).toBe('development');
    });
  });

  describe('Feature Flags', () => {
    it('should have feature flags object', () => {
      expect(env.features).toBeDefined();
      expect(typeof env.features).toBe('object');
    });

    it('should enable AI features in development', () => {
      expect(env.features.enableAI).toBe(true);
    });

    it('should enable offline mode', () => {
      expect(env.features.enableOfflineMode).toBe(true);
    });

    it('should enable PWA', () => {
      expect(env.features.enablePWA).toBe(true);
    });
  });

  describe('Debug Settings', () => {
    it('should have debug object', () => {
      expect(env.debug).toBeDefined();
      expect(typeof env.debug).toBe('object');
    });

    it('should enable logging in development', () => {
      expect(env.debug.enableLogging).toBe(true);
    });

    it('should enable verbose mode in development', () => {
      expect(env.debug.verbose).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate required keys', () => {
      const requiredKeys = [
        'geminiApiKey',
        'googleClientId',
        'githubClientId'
      ];

      requiredKeys.forEach(key => {
        expect(env[key]).toBeDefined();
        expect(env[key]).not.toBe('');
      });
    });

    it('should handle missing optional keys', () => {
      // Optional keys should have defaults or be undefined
      expect(env.sentryDsn).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should have correct types for boolean flags', () => {
      expect(typeof env.isDevelopment).toBe('boolean');
      expect(typeof env.isProduction).toBe('boolean');
      expect(typeof env.features.enableAI).toBe('boolean');
    });

    it('should have correct types for string values', () => {
      expect(typeof env.geminiApiKey).toBe('string');
      expect(typeof env.mode).toBe('string');
    });
  });

  describe('Production Configuration', () => {
    beforeEach(async () => {
      // Mock production environment
      vi.stubGlobal('import', {
        meta: {
          env: {
            ...mockEnv,
            MODE: 'production',
            DEV: false,
            PROD: true
          }
        }
      });

      vi.resetModules();
      const envModule = await import('./env');
      env = envModule.env;
    });

    it('should detect production mode', () => {
      expect(env.isProduction).toBe(true);
      expect(env.isDevelopment).toBe(false);
    });

    it('should disable debug logging in production', () => {
      expect(env.debug.enableLogging).toBe(false);
    });

    it('should disable verbose mode in production', () => {
      expect(env.debug.verbose).toBe(false);
    });
  });

  describe('Missing Environment Variables', () => {
    beforeEach(async () => {
      // Mock environment with missing variables
      vi.stubGlobal('import', {
        meta: {
          env: {
            MODE: 'development',
            DEV: true,
            PROD: false
          }
        }
      });

      vi.resetModules();
      const envModule = await import('./env');
      env = envModule.env;
    });

    it('should provide empty strings for missing API keys', () => {
      expect(env.geminiApiKey).toBe('');
      expect(env.googleClientId).toBe('');
    });

    it('should still work with missing optional keys', () => {
      expect(env.sentryDsn).toBeDefined();
      expect(env.analyticsId).toBeDefined();
    });
  });

  describe('URL Configuration', () => {
    it('should have API base URL', () => {
      expect(env.apiBaseUrl).toBeDefined();
      expect(typeof env.apiBaseUrl).toBe('string');
    });

    it('should have correct API URL format', () => {
      if (env.apiBaseUrl) {
        expect(env.apiBaseUrl).toMatch(/^https?:\/\//);
      }
    });
  });

  describe('Database Configuration', () => {
    it('should have database name', () => {
      expect(env.dbName).toBeDefined();
      expect(typeof env.dbName).toBe('string');
    });

    it('should use correct database name', () => {
      expect(env.dbName).toContain('mindhangar');
    });
  });

  describe('Timeout Configuration', () => {
    it('should have API timeout', () => {
      expect(env.apiTimeout).toBeDefined();
      expect(typeof env.apiTimeout).toBe('number');
    });

    it('should have reasonable timeout value', () => {
      expect(env.apiTimeout).toBeGreaterThan(0);
      expect(env.apiTimeout).toBeLessThanOrEqual(60000); // Max 60 seconds
    });
  });

  describe('Retry Configuration', () => {
    it('should have max retries', () => {
      expect(env.maxRetries).toBeDefined();
      expect(typeof env.maxRetries).toBe('number');
    });

    it('should have reasonable retry count', () => {
      expect(env.maxRetries).toBeGreaterThanOrEqual(0);
      expect(env.maxRetries).toBeLessThanOrEqual(5);
    });
  });
});
