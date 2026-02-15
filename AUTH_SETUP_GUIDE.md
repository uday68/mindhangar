# Authentication Setup Guide

This guide explains how to set up real OAuth authentication for MindHangar.

## Current Status

The authentication system supports two modes:

1. **Mock Authentication** (Default) - For development without OAuth credentials
2. **Real OAuth Authentication** - Production-ready OAuth with Google and GitHub

## Quick Start (Mock Auth)

By default, the app uses mock authentication. Just run:

```bash
# Frontend
npm run dev

# Backend (in another terminal)
cd backend
npm run dev
```

The login buttons will simulate OAuth without requiring real credentials.

## Setting Up Real OAuth

### Step 1: Get OAuth Credentials

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen if prompted
6. Application type: "Web application"
7. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
8. Copy the Client ID and Client Secret

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: "MindHangar"
   - Homepage URL: `http://localhost:5173` (development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID
6. Generate a new Client Secret and copy it

### Step 2: Configure Backend Environment

1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env.local
   ```

2. Edit `backend/.env.local` and add your credentials:
   ```env
   # Database (use Supabase or local PostgreSQL)
   DATABASE_URL=postgresql://user:password@localhost:5432/mindhangar
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here  # Generate with: openssl rand -base64 32
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # GitHub OAuth
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Encryption
   ENCRYPTION_KEY=your-encryption-key  # Generate with: openssl rand -hex 32
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

3. Generate secrets:
   ```bash
   # NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # ENCRYPTION_KEY
   openssl rand -hex 32
   ```

### Step 3: Set Up Database

1. Create a PostgreSQL database (or use Supabase)

2. Run migrations:
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   ```

### Step 4: Enable Real Auth in Frontend

1. Create or edit `.env` in the root directory:
   ```env
   VITE_USE_REAL_AUTH=true
   VITE_API_URL=http://localhost:3000
   ```

2. Restart the frontend dev server:
   ```bash
   npm run dev
   ```

### Step 5: Start Both Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

### Step 6: Test Authentication

1. Open `http://localhost:5173`
2. Click "Continue with Google" or "Continue with GitHub"
3. You'll be redirected to the OAuth provider
4. After authorization, you'll be redirected back to the app
5. Your session will be saved and persist across page refreshes

## Architecture

### Authentication Flow

1. User clicks login button
2. Frontend redirects to `http://localhost:3000/api/auth/signin/google`
3. Backend redirects to Google OAuth
4. User authorizes the app
5. Google redirects to `http://localhost:3000/api/auth/callback/google`
6. Backend creates session and user record
7. Backend redirects to frontend (`http://localhost:5173`)
8. Frontend calls `/api/session` to get user data
9. User is logged in

### Session Management

- Sessions use JWT tokens stored in httpOnly cookies
- Tokens are automatically refreshed by NextAuth
- Sessions expire after 7 days by default
- Frontend checks session on app initialization

### Security Features

- httpOnly cookies (prevents XSS)
- Secure cookies in production (HTTPS only)
- CSRF protection via NextAuth
- OAuth tokens encrypted at rest (AES-256-GCM)
- State parameter validation (prevents CSRF)

## Troubleshooting

### "Invalid redirect URI" error

Make sure your OAuth redirect URIs match exactly:
- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

### Session not persisting

1. Check that cookies are enabled in your browser
2. Make sure `NEXTAUTH_URL` matches your backend URL
3. Check browser console for CORS errors

### Database connection errors

1. Verify `DATABASE_URL` is correct
2. Make sure PostgreSQL is running
3. Check that migrations have been run

### "Cannot find module 'next-auth'" error

Install dependencies:
```bash
cd backend
npm install
```

## Switching Between Mock and Real Auth

To switch back to mock auth:

1. Edit `.env`:
   ```env
   VITE_USE_REAL_AUTH=false
   ```

2. Restart frontend:
   ```bash
   npm run dev
   ```

The app will use mock authentication without requiring OAuth credentials.

## Production Deployment

See `backend/DEPLOYMENT.md` for production deployment instructions.

## API Endpoints

### Authentication
- `GET /api/auth/signin/:provider` - Initiate OAuth flow
- `GET /api/auth/callback/:provider` - OAuth callback
- `POST /api/auth/signout` - Sign out
- `GET /api/session` - Get current session

### Health Check
- `GET /api/health` - Backend health status

## Next Steps

After authentication is working:

1. Implement user profile management (Task 6)
2. Implement course and progress APIs (Task 8)
3. Implement data synchronization (Task 9)
4. Deploy to production (Tasks 20-24)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review `backend/README.md` for backend details
3. Check browser console and backend logs for errors
