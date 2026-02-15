import { User, AuthProvider } from '../types';

// Import both mock and real auth services
import { authService as mockAuthService } from './authService.mock';
import { authService as realAuthService } from './authService.real';

/**
 * Authentication Service
 * 
 * Switches between mock and real authentication based on environment variable.
 * Set VITE_USE_REAL_AUTH=true to use real OAuth authentication.
 * 
 * Integration with Onboarding:
 * - After successful login, useStore checks if user has a profile in database
 * - If no profile exists, InitialInteractionModal is shown
 * - GeneralInteractionAgent collects student details conversationally
 * - Profile is saved to IndexedDB via dbQueries.users
 * - Subsequent logins skip onboarding if profile exists
 */

/**
 * Authentication Service Interface
 */
export interface AuthService {
  login: (provider: AuthProvider, email?: string, password?: string) => Promise<User | void>;
  logout: () => Promise<void>;
  getSession?: () => Promise<User | null>;
  refreshToken?: (refreshToken: string) => Promise<{ accessToken: string; refreshToken: string }>;
  validateToken?: (accessToken: string) => Promise<boolean>;
}

// Determine which auth service to use
// @ts-ignore - Vite env types
const USE_REAL_AUTH = import.meta.env?.VITE_USE_REAL_AUTH === 'true';

/**
 * Export the appropriate auth service based on environment
 */
export const authService: AuthService = USE_REAL_AUTH ? realAuthService : mockAuthService;

console.log(`🔐 Using ${USE_REAL_AUTH ? 'REAL' : 'MOCK'} authentication service`);

/**
 * Export for testing
 */
export const __testing__ = {
  USE_REAL_AUTH,
  mockAuthService,
  realAuthService,
};