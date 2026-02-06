# Backend Services Documentation

## Overview

MindHangar AI for Bharat includes a comprehensive suite of backend services that handle data management, user progress tracking, notifications, analytics, and cross-device synchronization.

## Architecture

```
src/services/
├── ContentService.ts       # Educational content management
├── ProgressService.ts      # Learning progress & achievements
├── NotificationService.ts  # Notifications & reminders
├── AnalyticsService.ts     # User behavior analytics
├── SyncService.ts          # Cross-device synchronization
├── OfflineSyncService.ts   # Offline data storage
├── BandwidthOptimizer.ts   # Data usage optimization
├── LanguageEngine.ts       # Multi-language support
├── CulturalFilter.ts       # Cultural context filtering
└── index.ts                # Service initialization
```

---

## 1. Content Service

**Purpose**: Manages educational content (notes, videos, quizzes, flashcards)

### Features
- ✅ Create, read, update, delete content
- ✅ Multi-language content support
- ✅ Offline caching with priority
- ✅ Video URL optimization for bandwidth
- ✅ Content search and filtering
- ✅ Tag-based organization

### Usage

```typescript
import { contentService } from '@/src/services';

// Create a note
const note = await contentService.createNote(
  userId,
  'My Study Notes',
  [
    { id: '1', type: 'heading', content: 'Chapter 1' },
    { id: '2', type: 'paragraph', content: 'Important concepts...' }
  ],
  'en',
  ['physics', 'mechanics']
);

// Create a video
const video = await contentService.createVideo(
  userId,
  {
    id: 'vid1',
    url: 'dQw4w9WgXcQ', // YouTube video ID
    title: 'Physics Lecture',
    summary: 'Introduction to mechanics'
  },
  'en'
);

// Get content with localization
const content = await contentService.getContent(contentId, 'hi');

// Cache for offline
await contentService.cacheForOffline(userId, contentId, 'en', 1);
```

### Content Types

- **Note**: Block-based notes (headings, paragraphs, todos, code)
- **Video**: YouTube videos with summaries and transcripts
- **Quiz**: Multiple-choice questions with explanations
- **Flashcard**: Front/back study cards
- **Roadmap**: Learning path with modules and resources

---

## 2. Progress Service

**Purpose**: Tracks user learning progress, XP, levels, and achievements

### Features
- ✅ Progress tracking per content
- ✅ XP and leveling system
- ✅ Study streak calculation
- ✅ Achievement system
- ✅ Study session tracking
- ✅ Daily goal monitoring
- ✅ Leaderboard support

### Usage

```typescript
import { progressService } from '@/src/services';

// Update progress
await progressService.updateProgress(
  userId,
  contentId,
  'en',
  {
    status: 'completed',
    score: 85,
    timeSpent: 1800 // 30 minutes
  }
);

// Get learning stats
const stats = await progressService.getLearningStats(userId);
console.log(`Level: ${stats.level}, XP: ${stats.xp}`);
console.log(`Streak: ${stats.currentStreak} days`);

// Start study session
const session = await progressService.startSession(userId);

// End session
await progressService.endSession(session.id);

// Check daily goal
const goal = await progressService.getDailyGoalProgress(userId);
console.log(`${goal.completed}/${goal.goal} minutes (${goal.percentage}%)`);
```

### XP Calculation

- Base XP: 10 points
- Score bonus:
  - 90%+: +20 XP
  - 80-89%: +15 XP
  - 70-79%: +10 XP
  - 60-69%: +5 XP
- Time bonus:
  - 30+ minutes: +10 XP
  - 15-29 minutes: +5 XP

### Level Formula

```
level = floor(sqrt(xp / 100)) + 1
```

---

## 3. Notification Service

**Purpose**: Manages notifications, reminders, and alerts

### Features
- ✅ In-app notifications
- ✅ Browser push notifications
- ✅ Study reminders with scheduling
- ✅ Achievement notifications
- ✅ Quiz result notifications
- ✅ Streak milestone alerts

### Usage

```typescript
import { notificationService } from '@/src/services';

// Request permission
await notificationService.requestPermission();

// Create notification
await notificationService.createNotification({
  userId,
  type: 'achievement',
  title: '🏆 Achievement Unlocked!',
  message: 'You completed 10 quizzes!',
  read: false
});

// Get notifications
const notifications = await notificationService.getNotifications(userId);

// Mark as read
await notificationService.markAsRead(userId, notificationId);

// Create study reminder
const reminder = await notificationService.createReminder({
  userId,
  title: 'Daily Study Time',
  time: '18:00',
  days: [1, 2, 3, 4, 5], // Monday-Friday
  enabled: true,
  sound: true
});
```

### Notification Types

- **achievement**: Achievement unlocked
- **reminder**: Study reminder
- **streak**: Streak milestone
- **level_up**: Level up notification
- **quiz_result**: Quiz completion
- **system**: System messages

---

## 4. Analytics Service

**Purpose**: Tracks user behavior and provides learning insights

### Features
- ✅ Event tracking
- ✅ Learning pattern analysis
- ✅ Usage metrics
- ✅ Personalized recommendations
- ✅ Data export
- ✅ Error tracking

### Usage

```typescript
import { analyticsService } from '@/src/services';

// Track events
await analyticsService.trackPageView(userId, '/dashboard');
await analyticsService.trackContentInteraction(
  userId,
  contentId,
  'video',
  'view'
);
await analyticsService.trackQuizAttempt(
  userId,
  quizId,
  8, // score
  10, // total
  300 // time in seconds
);

// Analyze learning patterns
const patterns = await analyticsService.analyzeLearningPatterns(userId);
console.log(`Preferred study time: ${patterns.preferredStudyTime}`);
console.log(`Average session: ${patterns.averageSessionDuration} min`);
console.log(`Focus score: ${patterns.focusScore}/100`);

// Get recommendations
const recommendations = await analyticsService.getRecommendations(userId);
recommendations.forEach(rec => console.log(`💡 ${rec}`));

// Export data
const data = await analyticsService.exportData(userId);
```

### Tracked Events

- `page_view`: Page navigation
- `content_interaction`: Content actions (view, create, edit, delete, complete)
- `quiz_attempt`: Quiz completion
- `study_session`: Study session details
- `feature_usage`: Feature interactions
- `error`: Error occurrences

---

## 5. Sync Service

**Purpose**: Synchronizes data across devices

### Features
- ✅ Automatic sync every 5 minutes
- ✅ Manual force sync
- ✅ Conflict resolution
- ✅ Sync status tracking
- ✅ Bandwidth-aware syncing
- ✅ Offline queue management

### Usage

```typescript
import { syncService } from '@/src/services';

// Initialize
await syncService.initialize(userId);

// Force sync
await syncService.forceSyncNow(userId);

// Get sync status
const status = syncService.getSyncStatus(userId);
console.log(`Last sync: ${syncService.getTimeSinceLastSync(userId)}`);
console.log(`Pending changes: ${status.pendingChanges}`);

// Mark content as changed
syncService.markAsChanged(userId);

// Check if sync needed
if (syncService.needsSync(userId)) {
  await syncService.syncAll(userId);
}

// Resolve conflict
await syncService.resolveConflict(userId, conflict, 'local');
```

### Sync Priority

1. **User Progress** (highest priority)
2. **Content** (medium priority)
3. **Settings** (lowest priority)

---

## 6. Offline Sync Service

**Purpose**: Manages offline data storage using IndexedDB

### Features
- ✅ IndexedDB storage
- ✅ Online/offline detection
- ✅ Automatic sync when online
- ✅ Sync queue management
- ✅ Data persistence

### Usage

```typescript
import { offlineSyncService } from '@/src/services';

// Initialize
await offlineSyncService.init();

// Save data offline
await offlineSyncService.saveNote({
  id: 'note1',
  content: 'My notes...'
});

await offlineSyncService.saveTask({
  id: 'task1',
  title: 'Complete homework',
  completed: false
});

// Get offline data
const notes = await offlineSyncService.getNotes();
const tasks = await offlineSyncService.getTasks();

// Check status
const status = offlineSyncService.getStatus();
console.log(`Online: ${status.isOnline}`);
console.log(`Pending sync: ${status.pendingSync}`);
```

---

## 7. Bandwidth Optimizer

**Purpose**: Optimizes data usage for Indian students on limited data plans

### Features
- ✅ Automatic 2G/3G detection
- ✅ Low bandwidth mode
- ✅ Data usage tracking
- ✅ Video quality optimization
- ✅ Image compression
- ✅ API payload reduction

### Usage

```typescript
import { bandwidthOptimizer } from '@/src/services';

// Enable low bandwidth mode
bandwidthOptimizer.enableLowBandwidthMode();

// Optimize video URL
const optimizedUrl = bandwidthOptimizer.optimizeYouTubeUrl('dQw4w9WgXcQ');
// Returns: https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&vq=medium

// Track data usage
bandwidthOptimizer.trackDataUsage(1024 * 1024, 'videos'); // 1MB

// Get usage stats
const usage = bandwidthOptimizer.getDataUsage();
console.log(`Total: ${usage.usageMB} MB`);
console.log(`Rate: ${usage.rate}`);
console.log(`Videos: ${usage.breakdown.videos / (1024*1024)} MB`);

// Check mode
if (bandwidthOptimizer.isLowBandwidthMode()) {
  console.log('Low bandwidth mode active');
}
```

### Data Reduction Targets

- **Videos**: 360p quality (70% reduction)
- **Images**: Compressed (50% reduction)
- **API**: Reduced payloads (30% reduction)
- **Overall**: 150MB → 50MB per 30 minutes

---

## Initialization

### App-Level Initialization

Add to your `App.tsx`:

```typescript
import { initializeBackendServices, cleanupBackendServices } from '@/src/services';

function App() {
  const { user } = useStore();

  useEffect(() => {
    if (user) {
      initializeBackendServices(user.id).then(() => {
        console.log('✅ Backend services ready');
      });

      return () => {
        cleanupBackendServices();
      };
    }
  }, [user]);

  // ... rest of app
}
```

### What Gets Initialized

1. **Database**: SQLite with cultural context data
2. **Offline Sync**: IndexedDB storage
3. **Sync Service**: Cross-device synchronization
4. **Analytics**: Event tracking

---

## Data Flow

```
User Action
    ↓
Frontend Component
    ↓
Service Layer (ContentService, ProgressService, etc.)
    ↓
├─→ Database (SQLite via Drizzle ORM)
├─→ Offline Storage (IndexedDB)
├─→ Analytics (Event tracking)
└─→ Sync Queue (For cross-device sync)
    ↓
Backend API (Future: REST/GraphQL)
```

---

## Storage Breakdown

### LocalStorage
- User preferences
- Session data
- Sync status
- Analytics events (last 1000)
- Notifications

### IndexedDB
- Notes
- Tasks
- Videos
- Quizzes
- Offline cache (up to 100MB)

### SQLite (via Drizzle)
- User profiles
- Content metadata
- Progress tracking
- Cultural contexts
- Translations

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Services load on-demand
2. **Debouncing**: Sync operations debounced
3. **Caching**: Frequently accessed data cached
4. **Compression**: Large data compressed
5. **Pagination**: Large lists paginated
6. **Indexing**: Database properly indexed

### Memory Management

- Analytics: Max 1000 events in memory
- Notifications: Max 100 per user
- Offline cache: Max 100MB per user
- Auto-cleanup of expired data

---

## Error Handling

All services include comprehensive error handling:

```typescript
try {
  await contentService.createNote(/* ... */);
} catch (error) {
  console.error('Error creating note:', error);
  // Service returns null or empty array on error
  // User-facing error shown via notification
}
```

### Error Tracking

```typescript
await analyticsService.trackError(userId, error, 'ContentService.createNote');
```

---

## Testing

### Unit Tests

```bash
npm test src/services/ContentService.test.ts
npm test src/services/ProgressService.test.ts
```

### Integration Tests

```bash
npm test src/services/integration.test.ts
```

---

## Future Enhancements

### Planned Features

1. **Real Backend API**: REST/GraphQL endpoints
2. **WebSocket**: Real-time sync
3. **Cloud Storage**: S3/CloudFlare R2 integration
4. **AI Recommendations**: ML-based content suggestions
5. **Social Features**: Study groups, leaderboards
6. **Payment Integration**: Razorpay/Paytm
7. **Video Streaming**: HLS/DASH support
8. **Voice Notes**: Audio recording and transcription

---

## API Reference

### Complete Service API

See individual service files for detailed API documentation:

- [ContentService.ts](src/services/ContentService.ts)
- [ProgressService.ts](src/services/ProgressService.ts)
- [NotificationService.ts](src/services/NotificationService.ts)
- [AnalyticsService.ts](src/services/AnalyticsService.ts)
- [SyncService.ts](src/services/SyncService.ts)

---

## Support

For issues or questions:
- Check the [DEVELOPER_ACTION_PLAN.md](DEVELOPER_ACTION_PLAN.md)
- Review [CONTRIBUTING.md](CONTRIBUTING.md)
- Open an issue on GitHub

---

**Built with ❤️ for Indian Students**
