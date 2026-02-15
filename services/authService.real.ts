import { User, AuthProvider } from '../types';

/**
 * Real Authentication Service
 * 
 * This service integrates with the Next.js backend OAuth implementation.
 * It handles OAuth redirects, session management, and token refresh.
 */

// @ts-ignore - Vite env types
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';

export interface AuthService {
  login: (provider: AuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  getSession: () => Promise<User | null>;
  refreshToken?: (refreshToken: string) => Promise<{ accessToken: string; refreshToken: string }>;
  validateToken?: (accessToken: string) => Promise<boolean>;
}

/**
 * Real Authentication Service Implementation
 * 
 * Connects to the Next.js backend for OAuth authentication.
 */
export const authService: AuthService = {
  /**
   * Initiate OAuth login flow or email/password login
   * 
   * For OAuth: Redirects the user to the backend OAuth endpoint
   * For credentials: Calls NextAuth credentials provider
   * 
   * @param provider - Auth provider (google, github, credentials)
   * @param email - Email for credentials login
   * @param password - Password for credentials login
   */
  login: async (provider: AuthProvider, email?: string, password?: string): Promise<void> => {
    try {
      if (provider === 'credentials' && email && password) {
        // Email/password login via NextAuth
        const response = await fetch(`${API_URL}/api/auth/callback/credentials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error('Invalid email or password');
        }

        // Session created, reload to restore it
        window.location.reload();
        return;
      }

      // OAuth redirect
      const callbackUrl = encodeURIComponent(window.location.origin);
      window.location.href = `${API_URL}/api/auth/signin/${provider}?callbackUrl=${callbackUrl}`;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  /**
   * Log out user and clear session
   * 
   * Calls the backend logout endpoint to invalidate the session.
   */
  logout: async (): Promise<void> => {
    try {
      // Call backend logout endpoint
      const callbackUrl = encodeURIComponent(window.location.origin);
      window.location.href = `${API_URL}/api/auth/signout?callbackUrl=${callbackUrl}`;
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Don't throw - logout should always succeed on client side
      // Just redirect to home
      window.location.href = '/';
    }
  },

  /**
   * Get current session from backend
   * 
   * Fetches the current user session from the backend.
   * This is called on app initialization to restore the session.
   * 
   * @returns User object if authenticated, null otherwise
   */
  getSession: async (): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/api/session`, {
        method: 'GET',
        credentials: 'include', // Include cookies for session
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          return null;
        }
        throw new Error(`Session check failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.user) {
        return null;
      }

      // Transform backend session to frontend User type
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.name}`,
        provider: data.user.provider as AuthProvider,
        joinedAt: new Date(), // Backend should provide this
        accessToken: data.accessToken,
        // profile will be loaded separately if it exists
      };

      console.log('✅ Session restored:', { userId: user.id, provider: user.provider });
      
      return user;
    } catch (error) {
      console.error('❌ Session check failed:', error);
      return null;
    }
  },

  /**
   * Refresh access token using refresh token
   * 
   * Note: NextAuth handles token refresh automatically via JWT callbacks
   * This method is provided for compatibility but may not be needed
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/session`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      return {
        accessToken: data.accessToken || '',
        refreshToken: refreshToken, // NextAuth manages refresh tokens internally
      };
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw error;
    }
  },

  /**
   * Validate access token
   * 
   * Checks if the current session is still valid.
   */
  validateToken: async (accessToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/session`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      return false;
    }
  },
};
