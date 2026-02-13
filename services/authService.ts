import { User, AuthProvider } from '../types';

/**
 * Authentication Service
 * 
 * Mock service that simulates OAuth authentication flow.
 * In production, this would:
 * 1. Redirect to `${API_URL}/auth/${provider}` for OAuth
 * 2. Handle callback with token exchange
 * 3. Validate tokens with backend
 * 4. Fetch user profile from database
 * 
 * Integration with Onboarding:
 * - After successful login, useStore checks if user has a profile in database
 * - If no profile exists, InitialInteractionModal is shown
 * - GeneralInteractionAgent collects student details conversationally
 * - Profile is saved to IndexedDB via dbQueries.users
 * - Subsequent logins skip onboarding if profile exists
 */

const MOCK_DELAY = 1500;
const LOGOUT_DELAY = 500;

/**
 * Polyfill for crypto.randomUUID for older browsers
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Mock user data for different OAuth providers
 * In production, this data would come from the OAuth provider's API
 */
const mockUsers: Record<string, Partial<User>> = {
  google: {
    name: 'Alex Student',
    email: 'alex.student@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  },
  github: {
    name: 'Dev Scholar',
    email: 'dev@github.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev',
  }
};

/**
 * Authentication Service Interface
 */
export interface AuthService {
  login: (provider: AuthProvider) => Promise<User>;
  logout: () => Promise<void>;
  refreshToken?: (refreshToken: string) => Promise<{ accessToken: string; refreshToken: string }>;
  validateToken?: (accessToken: string) => Promise<boolean>;
}

/**
 * Mock Authentication Service
 * 
 * Simulates OAuth login flow with realistic delays and responses.
 * Returns user data that will be stored in Zustand and IndexedDB.
 */
export const authService: AuthService = {
  /**
   * Authenticate user via OAuth provider
   * 
   * @param provider - OAuth provider (google, github, etc.)
   * @returns User object with authentication tokens
   * @throws Error if authentication fails
   */
  login: async (provider: AuthProvider): Promise<User> => {
    try {
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

      // Get mock user data for provider
      const mockUser = mockUsers[provider] || mockUsers['google'];
      
      // Generate unique user ID
      // In production, this would come from your backend after OAuth verification
      const userId = `${provider}_${generateUUID().slice(0, 8)}`;
      
      // Create user object
      // Note: profile is initially undefined - it will be populated after onboarding
      const user: User = {
        id: userId,
        name: mockUser.name!,
        email: mockUser.email!,
        avatar: mockUser.avatar!,
        provider,
        joinedAt: new Date(),
        accessToken: `mock_${provider}_access_token_${Date.now()}`,
        refreshToken: `mock_${provider}_refresh_token_${Date.now()}`,
        // profile will be set after onboarding via completeOnboarding()
      };

      console.log('✅ Authentication successful:', { userId, provider, email: user.email });
      
      return user;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw new Error(`Failed to authenticate with ${provider}. Please try again.`);
    }
  },

  /**
   * Log out user and clear session
   * 
   * In production, this would:
   * - Invalidate tokens on backend
   * - Clear cookies/session storage
   * - Redirect to login page
   */
  logout: async (): Promise<void> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, LOGOUT_DELAY));
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Don't throw - logout should always succeed on client side
    }
  },

  /**
   * Refresh access token using refresh token
   * 
   * @param refreshToken - Current refresh token
   * @returns New access and refresh tokens
   * 
   * Note: Not implemented in mock service
   * In production, this would exchange refresh token for new access token
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
    };
  },

  /**
   * Validate access token
   * 
   * @param accessToken - Token to validate
   * @returns true if token is valid
   * 
   * Note: Not implemented in mock service
   * In production, this would verify token with backend
   */
  validateToken: async (accessToken: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock: tokens starting with 'mock_' are valid
    return accessToken.startsWith('mock_');
  },
};

/**
 * Export for testing
 */
export const __testing__ = {
  generateUUID,
  mockUsers,
  MOCK_DELAY,
  LOGOUT_DELAY,
};