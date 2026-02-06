// Standardized error handling service
export enum ErrorCode {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  OFFLINE = 'OFFLINE',
  
  // Authentication Errors
  AUTH_FAILED = 'AUTH_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // API Errors
  API_ERROR = 'API_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_REQUEST = 'INVALID_REQUEST',
  
  // Data Errors
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // AI Errors
  AI_ERROR = 'AI_ERROR',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
  
  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  details?: any;
  timestamp: Date;
  retryable: boolean;
}

class ErrorService {
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  /**
   * Create a standardized error
   */
  createError(
    code: ErrorCode,
    message: string,
    userMessage: string,
    details?: any,
    retryable: boolean = false
  ): AppError {
    const error: AppError = {
      code,
      message,
      userMessage,
      details,
      timestamp: new Date(),
      retryable,
    };

    // Log error
    this.logError(error);

    return error;
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: any): AppError {
    if (!navigator.onLine) {
      return this.createError(
        ErrorCode.OFFLINE,
        'No internet connection',
        'You appear to be offline. Please check your internet connection.',
        error,
        true
      );
    }

    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      return this.createError(
        ErrorCode.TIMEOUT,
        'Request timeout',
        'The request took too long. Please try again.',
        error,
        true
      );
    }

    return this.createError(
      ErrorCode.NETWORK_ERROR,
      'Network error occurred',
      'Unable to connect to the server. Please try again.',
      error,
      true
    );
  }

  /**
   * Handle API errors
   */
  handleAPIError(error: any, endpoint?: string): AppError {
    const status = error.response?.status;

    switch (status) {
      case 401:
        return this.createError(
          ErrorCode.UNAUTHORIZED,
          'Unauthorized access',
          'Please log in to continue.',
          { endpoint, error },
          false
        );

      case 403:
        return this.createError(
          ErrorCode.AUTH_FAILED,
          'Access forbidden',
          'You don\'t have permission to access this resource.',
          { endpoint, error },
          false
        );

      case 404:
        return this.createError(
          ErrorCode.NOT_FOUND,
          'Resource not found',
          'The requested resource was not found.',
          { endpoint, error },
          false
        );

      case 429:
        return this.createError(
          ErrorCode.RATE_LIMIT,
          'Rate limit exceeded',
          'Too many requests. Please wait a moment and try again.',
          { endpoint, error },
          true
        );

      case 500:
      case 502:
      case 503:
        return this.createError(
          ErrorCode.API_ERROR,
          'Server error',
          'The server encountered an error. Please try again later.',
          { endpoint, error },
          true
        );

      default:
        return this.createError(
          ErrorCode.API_ERROR,
          error.message || 'API error',
          'An error occurred while processing your request.',
          { endpoint, error },
          true
        );
    }
  }

  /**
   * Handle AI service errors
   */
  handleAIError(error: any, provider: 'gemini' | 'huggingface'): AppError {
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return this.createError(
        ErrorCode.AI_QUOTA_EXCEEDED,
        `${provider} quota exceeded`,
        'AI service quota exceeded. Switching to alternative provider...',
        { provider, error },
        true
      );
    }

    return this.createError(
      ErrorCode.AI_ERROR,
      `${provider} error: ${error.message}`,
      'AI service is temporarily unavailable. Please try again.',
      { provider, error },
      true
    );
  }

  /**
   * Handle validation errors
   */
  handleValidationError(field: string, message: string): AppError {
    return this.createError(
      ErrorCode.VALIDATION_ERROR,
      `Validation failed: ${field}`,
      message,
      { field },
      false
    );
  }

  /**
   * Log error to console and storage
   */
  private logError(error: AppError) {
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorService]', error);
    }

    // Add to error log
    this.errorLog.unshift(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }

    // TODO: Send to error tracking service (Sentry) in production
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(new Error(error.message), {
    //     extra: error,
    //   });
    // }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(0, count);
  }

  /**
   * Clear error log
   */
  clearErrors() {
    this.errorLog = [];
  }

  /**
   * Retry helper with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          // Exponential backoff
          const delay = delayMs * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}

export const errorService = new ErrorService();
