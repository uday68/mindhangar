# Database Architecture - MindHangar AI for Bharat

## Overview

Your project uses a **dual-database architecture** to support both backend authentication and frontend offline-first functionality.

## 🗄️ Two Separate Databases

### 1. Backend Database (PostgreSQL)
**Location**: `backend/lib/db/schema.ts`  
**Connection**: `backend/lib/db/index.ts`  
**Database Type**: PostgreSQL (via Supabase or local PostgreSQL)  
**ORM**: Drizzle ORM with `postgres-js` driver

#### Purpose
- User authentication (OAuth + email/password)
- Session management (NextAuth.js)
- Server-side data synchronization
- Course and progress data that needs to be shared across devices

#### Connection Configuration
```typescript
// backend/lib/db/index.ts
const connectionString = process.env.DATABASE_URL;
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });
```

#### Environment Variable
```env
# backend/.env.local
DATABASE_URL=postgresql://user:password@host:5432/database
```

#### Tables (9 tables)

1. **users** - User accounts and profiles
   - Authentication data (email, password hash, OAuth tokens)
   - Profile data (language, region, educational board, grade)
   - Cultural context preferences
   - Created/updated timestamps

2. **accounts** - OAuth provider accounts (NextAuth)
   - Links users to OAuth providers (Google, GitHub)
   - Stores OAuth tokens and metadata
   - Supports multiple providers per user

3. **sessions** - Active user sessions (NextAuth)
   - Session tokens for authentication
   - Expiration tracking
   - User association

4. **verificationTokens** - Email verification tokens (NextAuth)
   - For email verification flow
   - Token expiration management

5. **courses** - User-created courses
   - Course metadata (title, description, level)
   - User ownership
   - Sync timestamps

6. **courseVideos** - Videos within courses
   - YouTube video IDs
   - Video metadata (title, duration, transcript)
   - Order within course

7. **userProgress** - Video completion tracking
   - Which videos users have completed
   - Completion timestamps
   - Sync metadata

8. **syncLog** - Data synchronization tracking
   - Sync operations history
   - Success/failure status
   - Conflict detection

#### Used By
- NextAuth.js authentication
- Backend API routes (`backend/app/api/`)
- Real authentication service (`services/authService.real.ts`)
- Session management

---

### 2. Frontend Database (IndexedDB)
**Location**: `src/db/schema.ts`  
**Connection**: `src/db/index.ts` + `src/db/browserDB.ts`  
**Database Type**: IndexedDB (browser-based)  
**ORM**: Drizzle ORM with SQLite schema (adapted for IndexedDB)

#### Purpose
- Offline-first functionality
- Local content caching
- Multi-language content storage
- Cultural context data
- User progress tracking (local)
- Works without internet connection

#### Connection Configuration
```typescript
// src/db/browserDB.ts
const dbName = 'mindhangar-bharat';
const dbVersion = 1;
const db = await openDB(dbName, dbVersion, { ... });
```

#### Storage Location
- Browser's IndexedDB (client-side only)
- No server connection required
- Data persists across browser sessions

#### Tables (13 tables)

1. **users** - Local user data cache
   - Cached user profile
   - Language and region preferences
   - Educational board and grade

2. **content** - Base educational content
   - Lessons, quizzes, videos
   - Subject, topic, difficulty
   - Educational board alignment

3. **contentTranslations** - Multi-language content
   - Translations in 8+ Indian languages
   - Cultural adaptations
   - Translation review status

4. **culturalContexts** - Regional cultural data
   - Festivals, historical figures
   - Geographical references
   - Cultural values and traditions
   - Preferred colors and themes

5. **assessmentQuestions** - Quiz questions
   - Multiple question types (MCQ, short answer, essay)
   - Subject and topic alignment
   - Competitive exam mapping (JEE, NEET, UPSC)

6. **assessmentQuestionTranslations** - Localized questions
   - Question translations
   - Localized options and explanations
   - Cultural adaptations

7. **userProgress** - Local progress tracking
   - Content completion status
   - Scores and time spent
   - Language-specific progress

8. **offlineCache** - Offline content storage
   - Cached content for offline use
   - Priority-based caching
   - Cache size management

9. **courses** - Local course data
   - YouTube-based courses
   - Course metadata
   - User-created courses

10. **courseVideos** - Course video metadata
    - YouTube video IDs
    - Video order and duration
    - Transcripts

11. **courseUserProgress** - Course completion tracking
    - Video completion status
    - Completion timestamps

12. **quizzes** - Course quizzes
    - Quiz questions (JSON)
    - Course association

13. **quizAttempts** - Quiz attempt history
    - User scores
    - Answers (JSON)
    - Attempt timestamps

#### Used By
- Frontend React components
- Offline functionality
- Language engine (`src/services/LanguageEngine.ts`)
- Cultural filter (`src/services/CulturalFilter.ts`)
- Content service (`src/services/ContentService.ts`)
- Progress service (`src/services/ProgressService.ts`)

---

## 🔄 Data Flow

### Authentication Flow
```
User Login
    ↓
LoginScreen.tsx
    ↓
authService.real.ts
    ↓
Backend API (NextAuth)
    ↓
PostgreSQL (users, accounts, sessions tables)
    ↓
Session Token returned
    ↓
Frontend stores session
    ↓
IndexedDB caches user data locally
```

### Content Delivery Flow
```
User requests content
    ↓
Check IndexedDB (offline cache)
    ↓
If cached → Return immediately
    ↓
If not cached → Fetch from backend/API
    ↓
Store in IndexedDB for offline use
    ↓
Apply language translation
    ↓
Apply cultural filter
    ↓
Display to user
```

### Sync Flow
```
User makes changes offline
    ↓
Store in IndexedDB
    ↓
Mark as "needs sync"
    ↓
When online → Sync to PostgreSQL
    ↓
Update syncLog table
    ↓
Resolve conflicts if any
    ↓
Update local IndexedDB with server data
```

---

## 📊 Database Comparison

| Feature | PostgreSQL (Backend) | IndexedDB (Frontend) |
|---------|---------------------|---------------------|
| **Location** | Server (Supabase/local) | Browser (client-side) |
| **Purpose** | Authentication, sync | Offline, caching |
| **Access** | Backend API only | Frontend JavaScript |
| **Persistence** | Permanent (server) | Permanent (browser) |
| **Sync** | Source of truth | Syncs from server |
| **Tables** | 9 tables | 13 tables |
| **Size Limit** | Unlimited (server) | ~50MB-1GB (browser) |
| **Multi-device** | Yes (shared) | No (per device) |
| **Offline** | No | Yes |

---

## 🔧 Setup Instructions

### Backend Database (PostgreSQL)

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy example file
   cp .env.example .env.local
   
   # Edit .env.local and set:
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

3. **Run Migrations**
   ```bash
   npm run db:generate  # Generate migration files
   npm run db:migrate   # Apply migrations to database
   ```

4. **Verify Connection**
   ```bash
   npm run dev
   # Check http://localhost:3000/api/health
   ```

### Frontend Database (IndexedDB)

1. **No Setup Required!**
   - IndexedDB is automatically created in the browser
   - Initialized on first app load

2. **Initialize with Data**
   ```typescript
   // Automatically called in App.tsx
   import { initializeDatabase } from '@/src/db';
   await initializeDatabase();
   ```

3. **Verify in Browser**
   - Open DevTools → Application → IndexedDB
   - Look for `mindhangar-bharat` database
   - Should see all 13 tables (object stores)

---

## 🔐 Security Considerations

### PostgreSQL (Backend)
- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ OAuth tokens encrypted (AES-256-GCM)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Connection pooling for performance
- ✅ HTTPS required in production
- ✅ Environment variables for secrets

### IndexedDB (Frontend)
- ⚠️ Data stored in plain text (browser storage)
- ⚠️ Accessible via browser DevTools
- ✅ Same-origin policy protection
- ✅ No sensitive data stored (passwords, tokens)
- ✅ User can clear data anytime
- ✅ Automatic cleanup of old cache

---

## 📈 Monitoring

### Backend Database
```typescript
// Check connection health
import { checkDatabaseConnection } from '@/backend/lib/db';
const isHealthy = await checkDatabaseConnection();
```

### Frontend Database
```typescript
// Check IndexedDB status
import { getBrowserDB } from '@/src/db/browserDB';
const db = await getBrowserDB();
console.log('IndexedDB ready:', !!db);
```

---

## 🚀 Production Deployment

### Backend Database
1. Use Supabase (recommended) or managed PostgreSQL
2. Set `DATABASE_URL` in production environment
3. Run migrations: `npm run db:migrate`
4. Enable connection pooling
5. Set up automated backups
6. Monitor query performance

### Frontend Database
1. No deployment needed (runs in browser)
2. Test across different browsers
3. Monitor cache size limits
4. Implement cache cleanup strategy
5. Handle quota exceeded errors

---

## 🔍 Debugging

### Backend Database Issues
```bash
# Test connection
psql $DATABASE_URL

# View tables
\dt

# Check migrations
npm run db:studio  # Opens Drizzle Studio
```

### Frontend Database Issues
```javascript
// Open browser console
// Check IndexedDB
const dbs = await indexedDB.databases();
console.log('Available databases:', dbs);

// Clear IndexedDB (if corrupted)
await indexedDB.deleteDatabase('mindhangar-bharat');
```

---

## 📝 Summary

**Two databases, two purposes:**

1. **PostgreSQL (Backend)** = Authentication, sync, multi-device data
   - Required for: Login, OAuth, session management
   - Connection: `DATABASE_URL` environment variable
   - Tables: 9 (users, accounts, sessions, courses, etc.)

2. **IndexedDB (Frontend)** = Offline, caching, local storage
   - Required for: Offline mode, fast content delivery
   - Connection: Automatic (browser)
   - Tables: 13 (content, translations, cultural contexts, etc.)

**They work together:**
- User logs in → PostgreSQL authenticates
- User data cached → IndexedDB stores locally
- User works offline → IndexedDB serves content
- User goes online → Syncs back to PostgreSQL

This architecture enables:
- ✅ Offline-first functionality
- ✅ Fast content delivery
- ✅ Multi-language support
- ✅ Cultural adaptation
- ✅ Low bandwidth optimization
- ✅ Multi-device sync

---

**Need help?** Check these files:
- Backend DB: `backend/lib/db/schema.ts`
- Frontend DB: `src/db/schema.ts`
- Connection docs: `backend/QUICKSTART.md`
- Setup guide: `AUTH_SETUP_GUIDE.md`
