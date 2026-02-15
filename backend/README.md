# MindHangar Backend

Production-ready authentication and API backend for MindHangar AI for Bharat platform.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Language**: TypeScript
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or Supabase)
- OAuth credentials (Google and/or GitHub)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:
- Database connection string
- OAuth provider credentials
- NextAuth secret (generate with: `openssl rand -base64 32`)
- Encryption key (32 characters minimum)

3. Run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

4. Start development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Project Structure

```
backend/
├── app/
│   └── api/              # API routes
│       ├── auth/         # Authentication endpoints
│       ├── users/        # User management
│       ├── courses/      # Course management
│       ├── progress/     # Progress tracking
│       ├── sync/         # Data synchronization
│       └── health/       # Health check
├── lib/
│   ├── db/              # Database configuration and schema
│   ├── utils/           # Utility functions
│   └── env.ts           # Environment validation
├── middleware.ts        # Global middleware
├── drizzle.config.ts    # Drizzle ORM configuration
├── next.config.ts       # Next.js configuration
└── tsconfig.json        # TypeScript configuration
```

## API Endpoints

### Health Check
- `GET /api/health` - Check backend health status

### Authentication (Coming in Task 2)
- `GET /api/auth/signin/:provider` - Initiate OAuth login
- `GET /api/auth/callback/:provider` - OAuth callback
- `GET /api/auth/session` - Get current session
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/signout` - Logout

### User Management (Coming in Task 6)
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update user profile
- `DELETE /api/users/me` - Delete user account

### Courses (Coming in Task 8)
- `GET /api/courses` - List user courses
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course details
- `PATCH /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Progress (Coming in Task 8)
- `POST /api/progress` - Update progress
- `GET /api/progress` - Get user progress

### Sync (Coming in Task 9)
- `POST /api/sync` - Sync user data
- `GET /api/sync?since=<timestamp>` - Get server data

## Database Schema

The database uses PostgreSQL with the following main tables:

- **users** - User accounts and profiles
- **sessions** - Authentication sessions
- **courses** - User-created courses
- **course_videos** - Videos within courses
- **user_progress** - Video completion tracking
- **sync_log** - Data synchronization history

See `lib/db/schema.ts` for complete schema definition.

## Environment Variables

Required variables:

- `NEXTAUTH_URL` - Backend URL
- `NEXTAUTH_SECRET` - Secret for NextAuth (32+ characters)
- `DATABASE_URL` - PostgreSQL connection string
- `FRONTEND_URL` - Frontend URL (for CORS)
- `JWT_SIGNING_KEY` - JWT signing key
- `ENCRYPTION_KEY` - Encryption key (32+ characters)

OAuth providers (at least one required):

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

Optional:

- `SENTRY_DSN` - Error tracking
- `REDIS_URL` - Session storage

## Security

- All API endpoints use HTTPS in production
- OAuth tokens encrypted at rest
- Session cookies are httpOnly, secure, sameSite=strict
- CORS configured for frontend origin only
- Rate limiting on all endpoints
- Input validation with Zod
- SQL injection prevention via parameterized queries

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm run start
```

## Testing

Run tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

## OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local`

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is running and accessible
- Ensure database user has proper permissions

### OAuth Errors

- Verify OAuth credentials are correct
- Check redirect URIs match exactly
- Ensure OAuth provider is enabled

### Environment Variable Errors

- Run `npm run dev` to see validation errors
- Check all required variables are set
- Verify variable formats (URLs, secrets)

## Support

For issues and questions, please refer to:
- [Design Document](.kiro/specs/real-authentication-backend/design.md)
- [Requirements](.kiro/specs/real-authentication-backend/requirements.md)
- [Task List](.kiro/specs/real-authentication-backend/tasks.md)

## License

Private - MindHangar AI for Bharat
