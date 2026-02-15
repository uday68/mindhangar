# Quick Start: Authentication

## TL;DR

Authentication is working! Three methods available:

### Mock Mode (Default - Works Now)
```bash
npm run dev
```
Click login. Choose OAuth or Email. Done. No setup needed.

### Real OAuth + Email/Password Mode (Requires Setup)

1. **Get OAuth credentials (optional):**
   - Google: https://console.cloud.google.com/apis/credentials
   - GitHub: https://github.com/settings/developers

2. **Configure backend:**
   ```bash
   cd backend
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Setup database:**
   ```bash
   npm install
   npm run db:generate
   npm run db:migrate
   ```

4. **Enable real auth:**
   ```env
   # .env in root
   VITE_USE_REAL_AUTH=true
   VITE_API_URL=http://localhost:3000
   ```

5. **Start servers:**
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   npm run dev
   ```

6. **Test:** Open http://localhost:5173

## Authentication Methods

### 1. Google OAuth
Click "Continue with Google" → Redirects to Google → Authorize → Logged in

### 2. GitHub OAuth
Click "Continue with GitHub" → Redirects to GitHub → Authorize → Logged in

### 3. Email/Password (NEW!)
Click "Continue with Email" → Enter email/password → Logged in

**Sign Up:**
- Click "Need an account?"
- Enter name, email, password (min 8 chars)
- Click "Sign Up"

**Sign In:**
- Enter email and password
- Click "Sign In"

## OAuth Redirect URIs

When creating OAuth apps, use these exact URLs:

- **Google:** `http://localhost:3000/api/auth/callback/google`
- **GitHub:** `http://localhost:3000/api/auth/callback/github`

## Environment Variables

### Backend (`backend/.env.local`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/mindhangar
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>

# OAuth (optional - can use email/password only)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

ENCRYPTION_KEY=<openssl rand -hex 32>
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env` in root)
```env
VITE_USE_REAL_AUTH=true
VITE_API_URL=http://localhost:3000
```

## Switch Between Modes

**To Mock:**
```env
VITE_USE_REAL_AUTH=false
```

**To Real:**
```env
VITE_USE_REAL_AUTH=true
```

Restart frontend after changing.

## Files to Check

- `EMAIL_PASSWORD_AUTH.md` - Email/password details
- `AUTH_SETUP_GUIDE.md` - Full setup instructions
- `AUTH_MVP_COMPLETE.md` - Implementation details
- `AUTH_IMPLEMENTATION_STATUS.md` - Current status

## Common Issues

**"User with this email already exists"**
→ Email already registered, use "Already have an account?"

**"Password must be at least 8 characters long"**
→ Use a longer password

**"Invalid email or password"**
→ Check credentials, passwords are case-sensitive

**"Invalid redirect URI"**
→ Check OAuth redirect URIs match exactly

**Session not persisting**
→ Check cookies enabled, verify NEXTAUTH_URL

**Database errors**
→ Run migrations: `cd backend && npm run db:migrate`

**Module not found**
→ Run `npm install` in both root and backend

## What Works

✅ Google OAuth
✅ GitHub OAuth
✅ Email/Password Registration
✅ Email/Password Login
✅ Session persistence
✅ Auto token refresh
✅ Secure logout
✅ Password hashing (bcrypt)
✅ Mock mode for development
✅ Real mode for production

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email/password
- `GET /api/auth/signin/:provider` - OAuth login
- `POST /api/auth/callback/credentials` - Email/password login
- `POST /api/auth/signout` - Logout
- `GET /api/session` - Get current session

## Next Steps

After authentication works:
1. Implement user profile API (Task 6)
2. Implement course/progress API (Task 8)
3. Implement data sync (Task 9)
4. Add email verification
5. Add password reset
6. Deploy to production (Tasks 20-24)

---

**Status:** ✅ MVP Complete - Three auth methods ready to use!
