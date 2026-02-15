# Deployment Guide

This guide covers deploying the MindHangar backend to production.

## Prerequisites

- Vercel account
- Supabase account (or other PostgreSQL provider)
- OAuth provider credentials (Google and/or GitHub)
- Domain name (optional, but recommended)

## Step 1: Database Setup (Supabase)

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Project Settings → Database
3. Copy the connection string (Connection pooling mode)
4. Save both `DATABASE_URL` (pooler) and `DIRECT_URL` (direct connection)

## Step 2: OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Application name: MindHangar Backend
4. Homepage URL: `https://your-domain.com`
5. Authorization callback URL:
   - Development: `http://localhost:3000/api/auth/callback/github`
   - Production: `https://your-domain.com/api/auth/callback/github`
6. Copy Client ID and Client Secret

## Step 3: Generate Secrets

Generate secure secrets for production:

```bash
# NEXTAUTH_SECRET (32+ characters)
openssl rand -base64 32

# JWT_SIGNING_KEY (32+ characters)
openssl rand -base64 32

# ENCRYPTION_KEY (exactly 32 characters)
openssl rand -base64 32 | cut -c1-32
```

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Select the `backend` directory as the root
5. Framework Preset: Next.js
6. Add environment variables (see below)
7. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd backend
vercel --prod
```

## Step 5: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

### Required Variables

```
NODE_ENV=production
NEXTAUTH_URL=https://your-backend-domain.vercel.app
NEXTAUTH_SECRET=<generated_secret>
DATABASE_URL=<supabase_pooler_url>
DIRECT_URL=<supabase_direct_url>
FRONTEND_URL=https://your-frontend-domain.com
NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app/api
JWT_SIGNING_KEY=<generated_secret>
ENCRYPTION_KEY=<generated_key>
```

### OAuth Providers

```
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GITHUB_CLIENT_ID=<your_github_client_id>
GITHUB_CLIENT_SECRET=<your_github_client_secret>
```

### Optional Variables

```
SENTRY_DSN=<your_sentry_dsn>
SENTRY_AUTH_TOKEN=<your_sentry_token>
REDIS_URL=<your_redis_url>
```

## Step 6: Run Database Migrations

After deployment, run migrations:

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="<your_supabase_direct_url>"

# Run migrations
npm run db:migrate:production
```

Or use Vercel CLI:

```bash
vercel env pull .env.production
npm run db:migrate:production
```

## Step 7: Verify Deployment

1. Check health endpoint: `https://your-domain.vercel.app/api/health`
2. Should return:
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

## Step 8: Update OAuth Redirect URIs

Update OAuth provider settings with production URLs:

- Google: Add `https://your-domain.vercel.app/api/auth/callback/google`
- GitHub: Add `https://your-domain.vercel.app/api/auth/callback/github`

## Step 9: Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable
5. Update OAuth redirect URIs

## Step 10: Set Up Monitoring

### Vercel Analytics

Automatically enabled for all Vercel projects.

### Sentry (Optional)

1. Create project at [Sentry](https://sentry.io)
2. Copy DSN
3. Add `SENTRY_DSN` to environment variables
4. Redeploy

## Rollback Procedure

If issues occur after deployment:

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Deployment will be rolled back instantly

## Monitoring and Maintenance

### Check Logs

```bash
# View logs via Vercel CLI
vercel logs <deployment-url>

# Or view in Vercel Dashboard → Deployments → Logs
```

### Database Backups

Supabase automatically backs up your database daily. To create manual backup:

1. Go to Supabase Dashboard → Database → Backups
2. Click "Create Backup"

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test locally
npm run build
npm test

# Deploy
git push
```

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Verify IP allowlist (if configured)

### OAuth Errors

- Verify redirect URIs match exactly
- Check OAuth credentials are correct
- Ensure OAuth provider is enabled

### Build Failures

- Check build logs in Vercel Dashboard
- Verify all environment variables are set
- Test build locally: `npm run build`

### Runtime Errors

- Check function logs in Vercel Dashboard
- Verify environment variables in production
- Check Sentry for error details

## Security Checklist

- [ ] All secrets are unique and secure (32+ characters)
- [ ] OAuth redirect URIs use HTTPS
- [ ] CORS is configured for frontend origin only
- [ ] Database credentials are not exposed
- [ ] Environment variables are set in Vercel (not in code)
- [ ] HSTS header is enabled
- [ ] Rate limiting is configured
- [ ] Error messages don't expose sensitive information

## Performance Optimization

- [ ] Database indexes are created
- [ ] Connection pooling is configured
- [ ] Caching is enabled for static data
- [ ] API response times are monitored
- [ ] CDN is configured for static assets

## Compliance

- [ ] Privacy policy is published
- [ ] Terms of service are published
- [ ] GDPR compliance is implemented
- [ ] Data retention policy is defined
- [ ] User data export is available
- [ ] User data deletion is available

## Support

For deployment issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Check [Next.js Documentation](https://nextjs.org/docs)
- Check [Supabase Documentation](https://supabase.com/docs)

For application issues:
- Review [Design Document](../.kiro/specs/real-authentication-backend/design.md)
- Review [Requirements](../.kiro/specs/real-authentication-backend/requirements.md)
- Check application logs in Vercel Dashboard
