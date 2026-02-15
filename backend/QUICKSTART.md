# Quick Start Guide

Get the MindHangar backend running in 5 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Generate Environment File

```bash
npm run setup
```

This creates `.env.local` with secure generated keys.

### 3. Configure Database

Edit `.env.local` and update:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
DIRECT_URL=postgresql://user:password@host:5432/database
```

**Using Supabase?**
1. Create project at [supabase.com](https://supabase.com)
2. Go to Project Settings → Database
3. Copy "Connection string" (Connection pooling)
4. Paste as `DATABASE_URL`
5. Copy "Connection string" (Direct connection)
6. Paste as `DIRECT_URL`

### 4. Run Database Migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

Backend is now running at `http://localhost:3000`

### 6. Verify Setup

Open `http://localhost:3000/api/health` in your browser.

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "healthy",
      "latency": 15
    }
  }
}
```

## Next Steps

### Add OAuth Providers (Optional for now)

You can add OAuth providers later when implementing authentication (Task 2).

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth credentials
3. Add to `.env.local`:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

**GitHub OAuth:**
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Create OAuth App
3. Add to `.env.local`:
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### Explore the API

- Health check: `GET http://localhost:3000/api/health`
- API documentation: See `README.md`

### View Database

```bash
npm run db:studio
```

Opens Drizzle Studio at `https://local.drizzle.studio`

## Troubleshooting

### "DATABASE_URL is not set"

Make sure `.env.local` exists and contains `DATABASE_URL`.

### Database connection failed

- Check database is running
- Verify connection string is correct
- Test connection: `psql <DATABASE_URL>`

### Port 3000 already in use

Change port in `.env.local`:
```env
PORT=3001
```

Or kill the process using port 3000:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Development Workflow

1. Make changes to code
2. Server auto-reloads (hot reload enabled)
3. Test changes at `http://localhost:3000`
4. Run tests: `npm test`
5. Check types: `npm run lint`

## Project Structure

```
backend/
├── app/
│   ├── api/              # API routes
│   │   └── health/       # Health check endpoint
│   ├── page.tsx          # Home page
│   └── layout.tsx        # Root layout
├── lib/
│   ├── db/              # Database config & schema
│   ├── utils/           # Utilities (crypto, errors)
│   └── env.ts           # Environment validation
├── .env.local           # Local environment variables
└── README.md            # Full documentation
```

## What's Next?

Task 1 (Backend Setup) is now complete! ✅

Next tasks:
- **Task 2**: Implement OAuth authentication with NextAuth.js
- **Task 3**: Implement session management
- **Task 5**: Implement security measures

See `tasks.md` for the complete implementation plan.

## Need Help?

- Read the full [README.md](./README.md)
- Check [Design Document](../.kiro/specs/real-authentication-backend/design.md)
- Review [Requirements](../.kiro/specs/real-authentication-backend/requirements.md)
