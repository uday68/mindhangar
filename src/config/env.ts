// Environment configuration service
// Centralizes all environment variable access with type safety

interface EnvironmentConfig {
  // App
  appName: string;
  appVersion: string;
  appEnv: 'development' | 'production' | 'staging';
  
  // API
  apiUrl: string;
  wsUrl: string;
  
  // AI Services
  geminiApiKey: string;
  huggingfaceApiKey: string;
  
  // Auth
  googleClientId: string;
  githubClientId: string;
  
  // Search & Translation
  googleSearchApiKey: string;
  googleSearchEngineId: string;
  googleTranslateApiKey: string;
  
  // Payment
  stripePublicKey: string;
  razorpayKeyId: string;
  
  // Analytics
  googleAnalyticsId: string;
  sentryDsn: string;
  
  // Feature Flags
  enableOfflineMode: boolean;
  enableVoiceInput: boolean;
  enableSemanticSearch: boolean;
}

class EnvironmentService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validate();
  }

  private loadConfig(): EnvironmentConfig {
    return {
      // App
      appName: import.meta.env.VITE_APP_NAME || 'MindHangar AI for Bharat',
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
      appEnv: (import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development') as any,
      
      // API
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
      wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
      
      // AI Services
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '',
      huggingfaceApiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
      
      // Auth
      googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
      
      // Search & Translation
      googleSearchApiKey: import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || '',
      googleSearchEngineId: import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '',
      googleTranslateApiKey: import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || '',
      
      // Payment
      stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
      razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
      
      // Analytics
      googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
      sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
      
      // Feature Flags
      enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
      enableVoiceInput: import.meta.env.VITE_ENABLE_VOICE_INPUT === 'true',
      enableSemanticSearch: import.meta.env.VITE_ENABLE_SEMANTIC_SEARCH === 'true',
    };
  }

  private validate() {
    const errors: string[] = [];

    // Required in production
    if (this.config.appEnv === 'production') {
      if (!this.config.geminiApiKey && !this.config.huggingfaceApiKey) {
        errors.push('At least one AI API key (Gemini or HuggingFace) is required in production');
      }
      
      if (!this.config.googleClientId) {
        errors.push('Google Client ID is required for authentication in production');
      }
      
      if (!this.config.sentryDsn) {
        console.warn('⚠️ Sentry DSN not configured - error tracking disabled');
      }
    }

    if (errors.length > 0) {
      console.error('❌ Environment configuration errors:');
      errors.forEach(error => console.error(`  - ${error}`));
      
      if (this.config.appEnv === 'production') {
        throw new Error('Invalid production configuration');
      }
    }
  }

  // Getters
  get isDevelopment(): boolean {
    return this.config.appEnv === 'development';
  }

  get isProduction(): boolean {
    return this.config.appEnv === 'production';
  }

  get isStaging(): boolean {
    return this.config.appEnv === 'staging';
  }

  // API Configuration
  get api() {
    return {
      baseUrl: this.config.apiUrl,
      wsUrl: this.config.wsUrl,
      timeout: 30000, // 30 seconds
    };
  }

  // AI Configuration
  get ai() {
    return {
      geminiApiKey: this.config.geminiApiKey,
      huggingfaceApiKey: this.config.huggingfaceApiKey,
      hasGemini: !!this.config.geminiApiKey,
      hasHuggingFace: !!this.config.huggingfaceApiKey,
    };
  }

  // Auth Configuration
  get auth() {
    return {
      googleClientId: this.config.googleClientId,
      githubClientId: this.config.githubClientId,
    };
  }

  // Search Configuration
  get search() {
    return {
      apiKey: this.config.googleSearchApiKey,
      engineId: this.config.googleSearchEngineId,
      enabled: !!this.config.googleSearchApiKey && !!this.config.googleSearchEngineId,
    };
  }

  // Translation Configuration
  get translation() {
    return {
      apiKey: this.config.googleTranslateApiKey,
      enabled: !!this.config.googleTranslateApiKey,
    };
  }

  // Payment Configuration
  get payment() {
    return {
      stripePublicKey: this.config.stripePublicKey,
      razorpayKeyId: this.config.razorpayKeyId,
      hasStripe: !!this.config.stripePublicKey,
      hasRazorpay: !!this.config.razorpayKeyId,
    };
  }

  // Analytics Configuration
  get analytics() {
    return {
      googleAnalyticsId: this.config.googleAnalyticsId,
      sentryDsn: this.config.sentryDsn,
      enabled: this.isProduction,
    };
  }

  // Feature Flags
  get features() {
    return {
      offlineMode: this.config.enableOfflineMode,
      voiceInput: this.config.enableVoiceInput,
      semanticSearch: this.config.enableSemanticSearch,
      enableAI: true, // Always enabled
      enableOfflineMode: this.config.enableOfflineMode,
      enablePWA: true, // Always enabled
    };
  }

  // App Info
  get app() {
    return {
      name: this.config.appName,
      version: this.config.appVersion,
      env: this.config.appEnv,
    };
  }

  // Additional properties for backward compatibility
  get geminiApiKey() {
    return this.config.geminiApiKey;
  }

  get googleClientId() {
    return this.config.googleClientId;
  }

  get githubClientId() {
    return this.config.githubClientId;
  }

  get searchApiKey() {
    return this.config.googleSearchApiKey;
  }

  get searchEngineId() {
    return this.config.googleSearchEngineId;
  }

  get translateApiKey() {
    return this.config.googleTranslateApiKey;
  }

  get stripePublicKey() {
    return this.config.stripePublicKey;
  }

  get razorpayKeyId() {
    return this.config.razorpayKeyId;
  }

  get sentryDsn() {
    return this.config.sentryDsn;
  }

  get analyticsId() {
    return this.config.googleAnalyticsId;
  }

  get mode() {
    return this.config.appEnv;
  }

  get apiBaseUrl() {
    return this.config.apiUrl;
  }

  get dbName() {
    return 'mindhangar-bharat.db';
  }

  get apiTimeout() {
    return 30000; // 30 seconds
  }

  get maxRetries() {
    return 3;
  }

  get debug() {
    return {
      enableLogging: this.isDevelopment,
      verbose: this.isDevelopment,
    };
  }

  // Debug info
  printConfig() {
    if (this.isDevelopment) {
      console.log('🔧 Environment Configuration:', {
        app: this.app,
        api: { baseUrl: this.api.baseUrl },
        ai: { hasGemini: this.ai.hasGemini, hasHuggingFace: this.ai.hasHuggingFace },
        auth: { hasGoogle: !!this.auth.googleClientId, hasGithub: !!this.auth.githubClientId },
        search: { enabled: this.search.enabled },
        translation: { enabled: this.translation.enabled },
        payment: { hasStripe: this.payment.hasStripe, hasRazorpay: this.payment.hasRazorpay },
        features: this.features,
      });
    }
  }
}

// Export singleton instance
export const env = new EnvironmentService();

// Print config in development
if (env.isDevelopment) {
  env.printConfig();
}
