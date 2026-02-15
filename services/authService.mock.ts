import { User, AuthProvider } from '../types';

/**
 * Mock Authentication Service
 * 
 * Simulates OAuth authentication flow with realistic delays and responses.
 * Used for development and testing without requiring real OAuth credentials.
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
 * Mock Authentication Service Implementation
 */
export const authService = {
  /**
   * Simulate OAuth login or email/password login
   */
  login: async (provider: AuthProvider, email?: string, password?: string): Promise<User> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

      if (provider === 'credentials' && email && password) {
        // Mock email/password login
        const userId = `credentials_${generateUUID().slice(0, 8)}`;
        
        const user: User = {
          id: userId,
          name: email.split('@')[0], // Use email prefix as name
          email: email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          provider: 'credentials' as AuthProvider,
          joinedAt: new Date(),
          accessToken: `mock_credentials_access_token_${Date.now()}`,
          refreshToken: `mock_credentials_refresh_token_${Date.now()}`,
        };

        console.log('✅ Mock email/password authentication successful:', { userId, email });
        return user;
      }

      // OAuth mock
      const mockUser = mockUsers[provider] || mockUsers['google'];
      const userId = `${provider}_${generateUUID().slice(0, 8)}`;
      
      const user: User = {
        id: userId,
        name: mockUser.name!,
        email: mockUser.email!,
        avatar: mockUser.avatar!,
        provider,
        joinedAt: new Date(),
        accessToken: `mock_${provider}_access_token_${Date.now()}`,
        refreshToken: `mock_${provider}_refresh_token_${Date.now()}`,
      };

      console.log('✅ Mock authentication successful:', { userId, provider, email: user.email });
      
      return user;
    } catch (error) {
      console.error('❌ Mock authentication failed:', error);
      throw new Error(`Failed to authenticate with ${provider}. Please try again.`);
    }
  },

  /**
   * Simulate logout
   */
  logout: async (): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, LOGOUT_DELAY));
      console.log('✅ Mock logout successful');
    } catch (error) {
      console.error('❌ Mock logout failed:', error);
    }
  },

  /**
   * Simulate token refresh
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
    };
  },

  /**
   * Simulate token validation
   */
  validateToken: async (accessToken: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return accessToken.startsWith('mock_');
  },
};

export const __testing__ = {
  generateUUID,
  mockUsers,
  MOCK_DELAY,
  LOGOUT_DELAY,
};
