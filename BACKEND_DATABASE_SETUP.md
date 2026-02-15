# Backend Database Setup Guide

## Issue Fixed ✅

The `drizzle-kit` commands have been updated to work with version 0.20.14.

## Updated Commands

```json
{
  "db:generate": "drizzle-kit generate:pg",  // Generate migration files
  "db:push": "drizzle-kit push:pg",          // Push schema directly to DB
  "db:studio": "drizzle-kit studio",         // Open Drizzle Studio
  "db:drop": "drizzle-kit drop"              // Drop all tables
}
```

## Setup Steps

### Step 1: Set Up Environment Variables

1. **Copy the example file**:
   ```bash
   cd backend
   copy .env.example .env.local
   ```

2. **Edit `.env.local`** and add your database URL:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

   **Options**:
   - **Supabase** (Recommended): Get free PostgreSQL at https://supabase.com
   - **Local PostgreSQL**: Install PostgreSQL locally
   - **Neon**: Free serverless PostgreSQL at https://neon.tech
   - **Railway**: https://railway.app

### Step 2: Generate Migration Files

```bash
cd backend
npm run db:generate
```

This will:
- Read your schema from `lib/db/schema.ts`
- Generate SQL migration files in `drizzle/` folder
- Create timestamped migration files

**Expected Output**:
```
✓ Generating migrations...
✓ Migrations generated successfully
```

### Step 3: Apply Migrations (Two Options)

#### Option A: Push Schema Directly (Faster for Development)
```bash
npm run db:push
```

This will:
- Push your schema directly to the database
- Create all tables immediately
- Skip migration files (good for development)

#### Option B: Run Migrations (Better for Production)
```bash
# Install tsx if not already installed
npm install -D tsx

# Create a migration script
```

Create `backend/scripts/migrate.ts`:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('✅ Migrations complete!');
  await sql.end();
}

main();
```

Add to `package.json`:
```json
{
  "scripts": {
    "db:migrate": "tsx scripts/migrate.ts"
  }
}
```

Then run:
```bash
npm run db:migrate
```

### Step 4: Verify Tables Created

#### Option 1: Using Drizzle Studio (Visual)
```bash
npm run db:studio
```

This opens a web interface at `https://local.drizzle.studio` where you can:
- View all tables
- Browse data
- Run queries

#### Option 2: Using psql (Command Line)
```bash
psql $DATABASE_URL

# List all tables
\dt

# Should see:
# - users
# - accounts
# - sessions
# - verification_tokens
# - courses
# - course_videos
# - user_progress
# - sync_log
```

#### Option 3: Using SQL Query
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Step 5: Test the Connection

Create `backend/scripts/test-db.ts`:
```typescript
import { db } from '../lib/db';
import { users } from '../lib/db/schema';

async function test() {
  try {
    console.log('Testing database connection...');
    
    // Try to query users table
    const result = await db.select().from(users).limit(1);
    console.log('✅ Database connection successful!');
    console.log('Users count:', result.length);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

test();
```

Add to `package.json`:
```json
{
  "scripts": {
    "db:test": "tsx scripts/test-db.ts"
  }
}
```

Run:
```bash
npm run db:test
```

## Common Issues & Solutions

### Issue 1: "DATABASE_URL is not set"
**Solution**: Make sure `.env.local` exists and has `DATABASE_URL` set.

### Issue 2: "Connection refused"
**Solution**: 
- Check if PostgreSQL is running
- Verify the connection string is correct
- Check firewall settings

### Issue 3: "SSL required"
**Solution**: Add `?sslmode=require` to your DATABASE_URL:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Issue 4: "Permission denied"
**Solution**: Make sure your database user has CREATE TABLE permissions.

### Issue 5: Tables already exist
**Solution**: Drop and recreate:
```bash
npm run db:drop
npm run db:push
```

## Database Providers Setup

### Supabase (Recommended)

1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password
6. Add to `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### Neon

1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Add to `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Local PostgreSQL

1. Install PostgreSQL
2. Create a database:
   ```bash
   createdb mindhangar
   ```
3. Add to `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/mindhangar
   ```

## Next Steps

After database is set up:

1. **Start the backend**:
   ```bash
   npm run dev
   ```

2. **Test the health endpoint**:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Test registration**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

4. **View data in Drizzle Studio**:
   ```bash
   npm run db:studio
   ```

## Troubleshooting

### Check Drizzle Kit Version
```bash
npx drizzle-kit --version
```

Should show: `0.20.14`

### Update Drizzle Kit (if needed)
```bash
npm install -D drizzle-kit@latest
```

Then update commands in `package.json` to use the new syntax.

### View Generated Migrations
```bash
ls -la drizzle/
```

Should see `.sql` files with timestamps.

### Manual SQL Execution
If migrations fail, you can run the SQL manually:
```bash
psql $DATABASE_URL < drizzle/0000_initial.sql
```

## Summary

✅ Commands fixed for drizzle-kit 0.20.14
✅ Use `npm run db:generate` to create migrations
✅ Use `npm run db:push` to apply schema (fastest)
✅ Use `npm run db:studio` to view data
✅ Set up DATABASE_URL in `.env.local`
✅ Test with `npm run db:test`

**Ready to go!** Run the commands in order and your database will be set up.
