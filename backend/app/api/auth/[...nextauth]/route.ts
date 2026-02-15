import { handlers } from '@/auth';

/**
 * NextAuth.js API Route Handler
 * 
 * This handles all authentication routes:
 * - GET /api/auth/signin - Sign in page
 * - POST /api/auth/signin/:provider - Initiate OAuth flow
 * - GET /api/auth/callback/:provider - OAuth callback
 * - GET /api/auth/signout - Sign out page
 * - POST /api/auth/signout - Sign out action
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/csrf - Get CSRF token
 * - GET /api/auth/providers - Get configured providers
 */
export const { GET, POST } = handlers;
