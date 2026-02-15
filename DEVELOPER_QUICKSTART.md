# 🚀 Developer Quick Start Guide

Get up and running with MindHangar AI for Bharat in 15 minutes!

## ⚡ Super Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone https://github.com/yourusername/mindhangar.git
cd mindhangar
npm install

# 2. Set up environment
cp .env.example .env

# 3. Start development
npm run dev

# 4. Open browser
# http://localhost:5173
```

That's it! The app will run in **mock mode** (no backend needed).

## 🎯 What You Get

- ✅ Full frontend working
- ✅ Mock authentication (no real login needed)
- ✅ IndexedDB database (works offline)
- ✅ All UI components
- ✅ Multi-language support
- ✅ Cultural contexts
- ⚠️ No real OAuth (use mock login)
- ⚠️ No backend sync (data stays local)

## 📝 Development Modes

### Mode 1: Frontend Only (Recommended for UI work)

**Best for**: UI development, component work, styling

```bash
# Install and start
npm install
npm run dev

# Mock authentication is enabled by default
# Just click "Continue with Google" or "Continue with GitHub"
# No real credentials needed!
```

**Features**:
- Mock authentication
- Local IndexedDB storage
- All UI components work
- No backend required

### Mode 2: Full Stack (For backend/auth work)

**Best for**: Authentication, database, API development

```bash
# 1. Set up backend
cd backend
npm install
cp .env.example .env.local

# 2. Add database URL to backend/.env.local
# DATABASE_URL=postgresql://...

# 3. Set up database
npm run db:push

# 4. Start backend
npm run dev

# 5. In another terminal, start frontend
cd ..
npm run dev

# 6. Enable real auth in .env
# VITE_USE_REAL_AUTH=true
```

**Features**:
- Real OAuth authentication
- PostgreSQL database
- Backend API
- Multi-device sync

## 🔑 Getting API Keys (Optional)

### YouTube API (for course creation)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add to `.env`:
   ```env
   VITE_YOUTUBE_API_KEY=your_key_here
   ```

### Gemini API (for AI features)

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Get API key
3. Add to `.env`:
   ```env
   GEMINI_API_KEY=your_key_here
   ```

**Note**: The app works without these keys using fallback methods!

## 🗄️ Database Setup (Optional)

### Option 1: Supabase (Easiest)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (free tier)
3. Go to Settings → Database
4. Copy "Connection string" (URI format)
5. Add to `backend/.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
6. Run migrations:
   ```bash
   cd backend
   npm run db:push
   ```

### Option 2: Local PostgreSQL

```bash
# Install PostgreSQL
# Windows: Download from postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt install postgresql

# Create database
createdb mindhangar

# Add to backend/.env.local
DATABASE_URL=postgresql://postgres:password@localhost:5432/mindhangar

# Run migrations
cd backend
npm run db:push
```

### Option 3: Skip Database

Just use mock mode! No database needed for frontend development.

## 🧪 Testing Your Setup

### Test Frontend

```bash
# Start dev server
npm run dev

# Open http://localhost:5173

# You should see:
# ✅ Login screen
# ✅ Can click "Continue with Google" (mock login)
# ✅ After login, see the main interface
# ✅ Can create courses, take notes, etc.
```

### Test Backend (if set up)

```bash
# In backend directory
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health

# Should return: {"status":"ok"}
```

### Test Database (if set up)

```bash
# Open Drizzle Studio
cd backend
npm run db:studio

# Opens https://local.drizzle.studio
# You should see all tables
```

## 🎨 Making Your First Change

### 1. Change the App Name

```typescript
// src/components/Layout/Navbar.tsx
// Find and change:
<span className="text-xl font-bold">MindHangar</span>

// To:
<span className="text-xl font-bold">Your App Name</span>
```

### 2. Add a New Language

```bash
# Copy English translations
cp src/i18n/messages/en.json src/i18n/messages/fr.json

# Edit fr.json and translate strings

# Add to src/i18n/index.ts
export const SUPPORTED_LANGUAGES = {
  // ... existing
  fr: 'Français',
};
```

### 3. Create a New Component

```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
};
```

### 4. Add a New Service

```typescript
// src/services/MyService.ts
export class MyService {
  async doSomething(): Promise<void> {
    console.log('Doing something...');
  }
}

export const myService = new MyService();
```

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module"

```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 5173 already in use"

```bash
# Solution: Kill the process or use different port
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.ts
```

### Issue: "Database connection failed"

```bash
# Solution: Check DATABASE_URL
# Make sure PostgreSQL is running
# Verify connection string is correct

# Test connection:
psql $DATABASE_URL
```

### Issue: "TypeScript errors"

```bash
# Solution: Restart TypeScript server
# VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or check for errors:
npm run type-check
```

## 📚 Next Steps

### Learn the Codebase

1. **Read the docs**:
   - [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
   - [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) - Database design
   - [docs/](docs/) - Additional documentation

2. **Explore the code**:
   - Start with `App.tsx` - Main entry point
   - Check `src/components/` - UI components
   - Look at `src/services/` - Business logic
   - Review `store/useStore.ts` - State management

3. **Run the tests**:
   ```bash
   npm run test
   ```

### Make Your First Contribution

1. **Find an issue**:
   - Look for "good first issue" labels
   - Or create your own feature

2. **Create a branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Make changes and test**:
   ```bash
   npm run test
   npm run lint
   ```

4. **Submit a pull request**:
   - Push to your fork
   - Create PR on GitHub
   - Wait for review

### Join the Community

- **GitHub Discussions**: Ask questions, share ideas
- **Issues**: Report bugs, request features
- **Pull Requests**: Contribute code

## 🎓 Learning Resources

### React & TypeScript
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Next.js & Backend
- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)

### State Management
- [Zustand Docs](https://docs.pmnd.rs/zustand/)

### Styling
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## 💡 Pro Tips

### 1. Use Mock Mode for Fast Development

```env
# .env
VITE_USE_REAL_AUTH=false  # Fast, no backend needed
```

### 2. Use Drizzle Studio for Database

```bash
cd backend
npm run db:studio
# Visual database editor!
```

### 3. Use Browser DevTools

- **Application → IndexedDB**: View local database
- **Network**: Monitor API calls
- **Console**: Check for errors

### 4. Use Hot Reload

Vite automatically reloads on file changes. No need to restart!

### 5. Use TypeScript Strictly

```typescript
// Enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## 🚀 Ready to Code!

You're all set! Start building amazing features for Indian students.

**Questions?** Check [CONTRIBUTING.md](CONTRIBUTING.md) or open an issue.

**Happy Coding!** 🎉
