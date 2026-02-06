import { describe, it, expect, beforeEach, vi } from 'vitest';
import { errorService, ErrorCode } from './ErrorService';

describe('ErrorService', () => {
  beforeEach(() => {
    // Clear error log before each test
    errorService.clearErrors();
  });

  describe('createError', () => {
    it('should create a standardized error', () => {
      const error = errorService.createError(
        ErrorCode.API_ERROR,
        'Test error',
        'User-friendly message',
        { detail: 'test' },
        true
      );

      expect(error.code).toBe(ErrorCode.API_ERROR);
      expect(error.message).toBe('Test error');
      expect(error.userMessage).toBe('User-friendly message');
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.retryable).toBe(true);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should log errors', () => {
      errorService.createError(
        ErrorCode.API_ERROR,
        'Test error',
        'User message'
      );

      const recentErrors = errorService.getRecentErrors(1);
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0].message).toBe('Test error');
    });

    it('should limit error log size', () => {
      // Create more than maxLogSize errors
      for (let i = 0; i < 150; i++) {
        errorService.createError(
          ErrorCode.API_ERROR,
          `Error ${i}`,
          'User message'
        );
      }

      const allErrors = errorService.getRecentErrors(200);
      expect(allErrors.length).toBeLessThanOrEqual(100);
    });
  });

  describe('handleNetworkError', () => {
    it('should detect offline status', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const error = errorService.handleNetworkError(new Error('Network error'));

      expect(error.code).toBe(ErrorCode.OFFLINE);
      expect(error.userMessage).toContain('offline');
      expect(error.retryable).toBe(true);

      // Restore
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
    });

    it('should detect timeout errors', () => {
      const timeoutError = new Error('Timeout');
      timeoutError.name = 'AbortError';

      const error = errorService.handleNetworkError(timeoutError);

      expect(error.code).toBe(ErrorCode.TIMEOUT);
      expect(error.userMessage).toContain('too long');
      expect(error.retryable).toBe(true);
    });

    it('should handle generic network errors', () => {
      const error = errorService.handleNetworkError(new Error('Connection failed'));

      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(error.userMessage).toContain('Unable to connect');
      expect(error.retryable).toBe(true);
    });
  });

  describe('handleAPIError', () => {
    it('should handle 401 unauthorized', () => {
      const error = errorService.handleAPIError(
        { response: { status: 401 } },
        '/api/test'
      );

      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.userMessage).toContain('log in');
      expect(error.retryable).toBe(false);
    });

    it('should handle 403 forbidden', () => {
      const error = errorService.handleAPIError(
        { response: { status: 403 } },
        '/api/test'
      );

      expect(error.code).toBe(ErrorCode.AUTH_FAILED);
      expect(error.userMessage).toContain('permission');
      expect(error.retryable).toBe(false);
    });

    it('should handle 404 not found', () => {
      const error = errorService.handleAPIError(
        { response: { status: 404 } },
        '/api/test'
      );

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.userMessage).toContain('not found');
      expect(error.retryable).toBe(false);
    });

    it('should handle 429 rate limit', () => {
      const error = errorService.handleAPIError(
        { response: { status: 429 } },
        '/api/test'
      );

      expect(error.code).toBe(ErrorCode.RATE_LIMIT);
      expect(error.userMessage).toContain('Too many requests');
      expect(error.retryable).toBe(true);
    });

    it('should handle 500 server errors', () => {
      const error = errorService.handleAPIError(
        { response: { status: 500 } },
        '/api/test'
      );

      expect(error.code).toBe(ErrorCode.API_ERROR);
      expect(error.userMessage).toContain('server');
      expect(error.retryable).toBe(true);
    });

    it('should handle unknown status codes', () => {
      const error = errorService.handleAPIError(
        { response: { status: 418 }, message: 'I am a teapot' },
        '/api/test'
      );

      expect(error.code).toBe(ErrorCode.API_ERROR);
      expect(error.retryable).toBe(true);
    });
  });

  describe('handleAIError', () => {
    it('should detect quota exceeded errors', () => {
      const quotaError = new Error('quota exceeded for this model');

      const error = errorService.handleAIError(quotaError, 'gemini');

      expect(error.code).toBe(ErrorCode.AI_QUOTA_EXCEEDED);
      expect(error.userMessage).toContain('quota exceeded');
      expect(error.retryable).toBe(true);
    });

    it('should detect limit errors', () => {
      const limitError = new Error('Rate limit reached');

      const error = errorService.handleAIError(limitError, 'huggingface');

      expect(error.code).toBe(ErrorCode.AI_QUOTA_EXCEEDED);
      expect(error.retryable).toBe(true);
    });

    it('should handle generic AI errors', () => {
      const aiError = new Error('Model failed to generate');

      const error = errorService.handleAIError(aiError, 'gemini');

      expect(error.code).toBe(ErrorCode.AI_ERROR);
      expect(error.userMessage).toContain('temporarily unavailable');
      expect(error.retryable).toBe(true);
    });
  });

  describe('handleValidationError', () => {
    it('should create validation errors', () => {
      const error = errorService.handleValidationError(
        'email',
        'Invalid email format'
      );

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toContain('email');
      expect(error.userMessage).toBe('Invalid email format');
      expect(error.retryable).toBe(false);
    });
  });

  describe('getRecentErrors', () => {
    it('should return recent errors', () => {
      errorService.createError(ErrorCode.API_ERROR, 'Error 1', 'Message 1');
      errorService.createError(ErrorCode.API_ERROR, 'Error 2', 'Message 2');
      errorService.createError(ErrorCode.API_ERROR, 'Error 3', 'Message 3');

      const recent = errorService.getRecentErrors(2);

      expect(recent).toHaveLength(2);
      expect(recent[0].message).toBe('Error 3'); // Most recent first
      expect(recent[1].message).toBe('Error 2');
    });

    it('should default to 10 errors', () => {
      for (let i = 0; i < 15; i++) {
        errorService.createError(ErrorCode.API_ERROR, `Error ${i}`, 'Message');
      }

      const recent = errorService.getRecentErrors();

      expect(recent).toHaveLength(10);
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      errorService.createError(ErrorCode.API_ERROR, 'Error 1', 'Message 1');
      errorService.createError(ErrorCode.API_ERROR, 'Error 2', 'Message 2');

      expect(errorService.getRecentErrors()).toHaveLength(2);

      errorService.clearErrors();

      expect(errorService.getRecentErrors()).toHaveLength(0);
    });
  });

  describe('retry', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Failed');
        }
        return 'success';
      });

      const result = await errorService.retry(fn, 3, 10);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Always fails');
      });

      await expect(errorService.retry(fn, 3, 10)).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Failed');
      });

      const startTime = Date.now();
      
      try {
        await errorService.retry(fn, 3, 100);
      } catch (error) {
        // Expected to fail
      }

      const duration = Date.now() - startTime;
      
      // Should take at least 100 + 200 = 300ms (exponential backoff)
      expect(duration).toBeGreaterThanOrEqual(300);
    });

    it('should succeed on first try', async () => {
      const fn = vi.fn(async () => 'success');

      const result = await errorService.retry(fn, 3, 10);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
