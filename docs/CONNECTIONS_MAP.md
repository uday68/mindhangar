# MindHangar Connections Map
**Date:** February 6, 2026  
**Purpose:** Document how all components are connected

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  React Components (Panels, Layout, Auth, Shared)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                          │
│  Zustand Store (store/useStore.ts)                          │
│  ├─ User State                                               │
│  ├─ Panel State                                              │
│  ├─ Pages & Blocks                                           │
│  └─ Settings & Notifications                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Database │  │   AI     │  │  Error   │
│ Queries  │  │ Services │  │ Service  │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Drizzle  │  │ Gemini   │  │  Error   │
│   ORM    │  │ HF API   │  │ Boundary │
└────┬─────┘  └────┬─────┘  └──────────┘
     │             │
     ▼             ▼
┌──────────┐  ┌──────────┐
│ SQLite   │  │ External │
│ Database │  │   APIs   │
└──────────┘  └──────────┘
```

---

## Component Connections

### 1. Database Layer

**Files:**
- `src/db/index.ts` - Database initialization with error handling
- `src/db/schema.ts` - Database schema definitions
- `src/db/queries.ts` - Query functions with error handling
- `src/db/notionLikeDB.ts` - In-memory block storage (legacy)

**Connections:**
```
src/db/index.ts
  ├─ Initializes SQLite database
  ├─ Enables WAL mode for performance
  ├─ Uses ErrorService for error handling
  └─ Exports getDB() function

src/db/queries.ts
  ├─ Imports getDB() from index.ts
  ├─ Imports ErrorService
  ├─ Exports userQueries
  ├─ Exports pageQueries
  ├─ Exports blockQueries
  ├─ Exports settingsQueries
  ├─ Exports notificationQueries
  ├─ Exports focusSessionQueries
  └─ Exports learnerProfileQueries

store/useStore.ts (TO BE UPDATED)
  ├─ Will import dbQueries
  ├─ Will use queries for persistence
  └─ Will replace localStorage with database
```

### 2. Error Handling Layer

**Files:**
- `src/services/ErrorService.ts` - Centralized error management
- `components/ErrorBoundary.tsx` - React error boundary
- `index.tsx` - Wraps app with ErrorBoundary

**Connections:**
```
ErrorService
  ├─ Defines error codes (enum ErrorCode)
  ├─ Creates standardized errors
  ├─ Handles network errors
  ├─ Handles API errors
  ├─ Handles AI errors
  ├─ Handles validation errors
  ├─ Provides retry logic
  └─ Logs errors (ready for Sentry)

ErrorBoundary
  ├─ Catches React errors
  ├─ Shows user-friendly UI
  ├─ Logs to ErrorService
  ├─ Provides reload option
  └─ Shows stack trace in dev mode

All Services
  ├─ Import ErrorService
  ├─ Use standardized error codes
  ├─ Throw AppError objects
  └─ Provide user-friendly messages
```

### 3. Environment Configuration

**Files:**
- `src/config/env.ts` - Environment service
- `.env.example` - Development environment template
- `.env.production.example` - Production environment template

**Connections:**
```
env service
  ├─ Loads environment variables
  ├─ Validates configuration
  ├─ Provides type-safe access
  ├─ Exports env singleton
  └─ Used by all services

Services using env:
  ├─ geminiService.ts (AI API key)
  ├─ HuggingFaceAIService.ts (AI API key)
  ├─ authService.ts (OAuth client IDs)
  ├─ SearchPanel.tsx (Search API key)
  └─ LanguageEngine.ts (Translation API key)
```

### 4. AI Services Layer

**Files:**
- `services/geminiService.ts` - Gemini API wrapper
- `src/services/HuggingFaceAIService.ts` - HuggingFace API
- `src/services/AIAssistantService.ts` - Unified AI interface

**Connections:**
```
AIAssistantService
  ├─ Imports geminiService
  ├─ Imports HuggingFaceAIService
  ├─ Imports ErrorService
  ├─ Imports env
  ├─ Provides unified interface
  ├─ Handles provider switching
  └─ Exports aiAssistant singleton

geminiService
  ├─ Imports env for API key
  ├─ Imports ErrorService
  ├─ Wraps Google Generative AI
  └─ Delegates to AIAssistantService

HuggingFaceAIService
  ├─ Imports env for API key
  ├─ Imports ErrorService
  ├─ Uses HuggingFace Inference API
  └─ Provides fallback for Gemini

Panels using AI:
  ├─ ChatPanel.tsx → aiAssistant
  ├─ PlannerPanel.tsx → aiAssistant
  ├─ QuizPanel.tsx → aiAssistant
  └─ VideoPanel.tsx → aiAssistant
```

### 5. State Management

**Files:**
- `store/useStore.ts` - Zustand store
- `src/db/queries.ts` - Database queries

**Current State (localStorage):**
```
useStore
  ├─ Uses Zustand persist middleware
  ├─ Stores data in localStorage
  ├─ Manages user state
  ├─ Manages panel state
  ├─ Manages pages & blocks
  └─ Manages settings & notifications
```

**Target State (Database):**
```
useStore (TO BE UPDATED)
  ├─ Imports dbQueries
  ├─ Uses database for persistence
  ├─ Syncs with localStorage for offline
  ├─ Handles database errors
  └─ Provides same interface to components
```

---

## Data Flow Examples

### Example 1: User Login

```
1. LoginScreen.tsx
   └─ Calls useStore().login('google')

2. store/useStore.ts
   └─ Calls authService.login('google')

3. services/authService.ts
   └─ Makes OAuth request (currently mock)
   └─ Returns User object

4. store/useStore.ts
   └─ Calls dbQueries.users.create(user)

5. src/db/queries.ts
   └─ Calls getDB().insert(users).values(...)

6. src/db/index.ts
   └─ Executes SQL query on SQLite

7. store/useStore.ts
   └─ Updates Zustand state
   └─ Persists to localStorage

8. App.tsx
   └─ Re-renders with user data
```

### Example 2: Create Note

```
1. NotesPanel.tsx
   └─ Calls useStore().createPage()

2. store/useStore.ts
   └─ Generates UUID
   └─ Calls dbQueries.pages.create(pageData)

3. src/db/queries.ts
   └─ Calls getDB().insert(pages).values(...)
   └─ Handles errors with ErrorService

4. src/db/index.ts
   └─ Executes SQL query

5. store/useStore.ts
   └─ Updates Zustand state
   └─ Persists to localStorage

6. NotesPanel.tsx
   └─ Re-renders with new page
```

### Example 3: AI Chat

```
1. ChatPanel.tsx
   └─ Calls aiAssistant.generateResponse()

2. src/services/AIAssistantService.ts
   └─ Checks if Gemini is available
   └─ Falls back to HuggingFace if needed

3. services/geminiService.ts OR src/services/HuggingFaceAIService.ts
   └─ Makes API request
   └─ Handles errors with ErrorService

4. src/services/ErrorService.ts
   └─ Catches API errors
   └─ Returns user-friendly message

5. ChatPanel.tsx
   └─ Displays response or error
```

### Example 4: Error Handling

```
1. Any Component
   └─ Throws error or crashes

2. components/ErrorBoundary.tsx
   └─ Catches error
   └─ Logs to ErrorService

3. src/services/ErrorService.ts
   └─ Creates AppError
   └─ Logs to console (dev)
   └─ Sends to Sentry (prod)

4. components/ErrorBoundary.tsx
   └─ Shows error UI
   └─ Provides reload option
```

---

## Integration Status

### ✅ Connected
- ErrorBoundary → App
- ErrorService → All services
- env → All services
- AI services → Panels
- Zustand → Components

### 🔄 Partially Connected
- Database queries → Created but not used by Zustand
- Error handling → Added to queries but not all services

### ❌ Not Connected
- Zustand → Database (still using localStorage)
- Real OAuth → authService (still mock)
- Real APIs → Search, Translation (still mock)
- Payment → Backend (not implemented)
- Analytics → Sentry, GA (not implemented)

---

## Next Steps to Complete Connections

### Priority 1: Connect Zustand to Database
1. Update `store/useStore.ts` to import `dbQueries`
2. Replace localStorage operations with database calls
3. Add error handling for database operations
4. Test data persistence

### Priority 2: Update All Services with Error Handling
1. Update `geminiService.ts` to use ErrorService
2. Update `HuggingFaceAIService.ts` to use ErrorService
3. Update `LanguageEngine.ts` to use ErrorService
4. Update `CulturalFilter.ts` to use ErrorService
5. Update all other services

### Priority 3: Connect Real APIs
1. Implement real OAuth in `authService.ts`
2. Integrate Google Custom Search API
3. Integrate Google Translate API
4. Integrate Web Speech API

### Priority 4: Backend Integration
1. Create Express.js backend
2. Implement API endpoints
3. Connect frontend to backend
4. Add authentication middleware

---

**Status:** Database and error handling infrastructure complete, ready for integration  
**Next:** Update Zustand store to use database queries
