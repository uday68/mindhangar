# Backend Services Integration Guide

## Quick Start

This guide shows how to integrate the backend services into your React components.

---

## 1. App-Level Initialization

Update your `App.tsx` to initialize backend services:

```typescript
import React, { useEffect } from 'react';
import { initializeBackendServices, cleanupBackendServices } from './src/services';
import { useStore } from './store/useStore';

function App() {
  const { user } = useStore();

  // Initialize backend services when user logs in
  useEffect(() => {
    if (user) {
      initializeBackendServices(user.id)
        .then(() => {
          console.log('✅ Backend services initialized');
        })
        .catch((error) => {
          console.error('❌ Failed to initialize backend services:', error);
        });

      // Cleanup on unmount
      return () => {
        cleanupBackendServices();
      };
    }
  }, [user]);

  // ... rest of your app
}
```

---

## 2. Notes Panel Integration

Update `components/Panels/NotesPanel.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { contentService, progressService, analyticsService } from '@/src/services';
import { useStore } from '@/store/useStore';

export const NotesPanel: React.FC = () => {
  const { user } = useStore();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load notes on mount
  useEffect(() => {
    if (user) {
      loadNotes();
      
      // Track page view
      analyticsService.trackPageView(user.id, '/notes');
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userNotes = await contentService.getContentByType(
        user.id,
        'note',
        'en',
        20
      );
      setNotes(userNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (title: string, blocks: any[]) => {
    if (!user) return;

    try {
      const note = await contentService.createNote(
        user.id,
        title,
        blocks,
        'en',
        []
      );

      setNotes([note, ...notes]);

      // Track analytics
      await analyticsService.trackContentInteraction(
        user.id,
        note.id,
        'note',
        'create'
      );

      // Update progress
      await progressService.updateProgress(
        user.id,
        note.id,
        'en',
        { status: 'in_progress' }
      );

      return note;
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const completeNote = async (noteId: string) => {
    if (!user) return;

    try {
      // Update progress
      await progressService.updateProgress(
        user.id,
        noteId,
        'en',
        {
          status: 'completed',
          timeSpent: 600 // 10 minutes
        }
      );

      // Track analytics
      await analyticsService.trackContentInteraction(
        user.id,
        noteId,
        'note',
        'complete'
      );

      // Reload notes
      await loadNotes();
    } catch (error) {
      console.error('Error completing note:', error);
    }
  };

  return (
    <div className="notes-panel">
      {loading ? (
        <div>Loading notes...</div>
      ) : (
        <div>
          {notes.map(note => (
            <div key={note.id}>
              <h3>{note.title}</h3>
              <button onClick={() => completeNote(note.id)}>
                Mark Complete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 3. Quiz Panel Integration

Update `components/Panels/QuizPanel.tsx`:

```typescript
import React, { useState } from 'react';
import { contentService, progressService, notificationService, analyticsService } from '@/src/services';
import { useStore } from '@/store/useStore';

export const QuizPanel: React.FC = () => {
  const { user } = useStore();
  const [quiz, setQuiz] = useState(null);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const startQuiz = async (quizData: any) => {
    if (!user) return;

    setQuiz(quizData);
    setScore(0);
    setStartTime(Date.now());

    // Track analytics
    await analyticsService.trackContentInteraction(
      user.id,
      quizData.id,
      'quiz',
      'view'
    );
  };

  const submitQuiz = async (answers: number[]) => {
    if (!user || !quiz) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correctAnswers = answers.filter((ans, idx) => 
      ans === quiz.questions[idx].correctIndex
    ).length;

    setScore(correctAnswers);

    try {
      // Save quiz result
      await contentService.createQuiz(user.id, {
        ...quiz,
        score: correctAnswers,
        totalQuestions: quiz.questions.length,
      }, 'en');

      // Update progress
      await progressService.updateProgress(
        user.id,
        quiz.id,
        'en',
        {
          status: 'completed',
          score: (correctAnswers / quiz.questions.length) * 100,
          timeSpent
        }
      );

      // Track analytics
      await analyticsService.trackQuizAttempt(
        user.id,
        quiz.id,
        correctAnswers,
        quiz.questions.length,
        timeSpent
      );

      // Send notification
      await notificationService.notifyQuizResult(
        user.id,
        correctAnswers,
        quiz.questions.length
      );

      // Show results
      alert(`You scored ${correctAnswers}/${quiz.questions.length}!`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  return (
    <div className="quiz-panel">
      {/* Quiz UI */}
    </div>
  );
};
```

---

## 4. Dashboard Integration

Update `components/Dashboard.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { progressService, analyticsService } from '@/src/services';
import { useStore } from '@/store/useStore';

export const Dashboard: React.FC = () => {
  const { user } = useStore();
  const [stats, setStats] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load learning stats
      const learningStats = await progressService.getLearningStats(user.id);
      setStats(learningStats);

      // Analyze learning patterns
      const userPatterns = await analyticsService.analyzeLearningPatterns(user.id);
      setPatterns(userPatterns);

      // Get recommendations
      const recs = await analyticsService.getRecommendations(user.id);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <div className="dashboard">
      {stats && (
        <div className="stats-section">
          <h2>Your Progress</h2>
          <div className="stat">
            <span>Level</span>
            <strong>{stats.level}</strong>
          </div>
          <div className="stat">
            <span>XP</span>
            <strong>{stats.xp}</strong>
          </div>
          <div className="stat">
            <span>Streak</span>
            <strong>{stats.currentStreak} days 🔥</strong>
          </div>
          <div className="stat">
            <span>Completion Rate</span>
            <strong>{patterns?.completionRate.toFixed(0)}%</strong>
          </div>
        </div>
      )}

      {patterns && (
        <div className="patterns-section">
          <h2>Learning Insights</h2>
          <p>Preferred study time: <strong>{patterns.preferredStudyTime}</strong></p>
          <p>Average session: <strong>{patterns.averageSessionDuration.toFixed(0)} min</strong></p>
          <p>Focus score: <strong>{patterns.focusScore.toFixed(0)}/100</strong></p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h2>Recommendations</h2>
          {recommendations.map((rec, idx) => (
            <div key={idx} className="recommendation">
              💡 {rec}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 5. Notification Panel Integration

Update `components/Panels/NotificationPanel.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { notificationService } from '@/src/services';
import { useStore } from '@/store/useStore';

export const NotificationPanel: React.FC = () => {
  const { user } = useStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Refresh every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const notifs = await notificationService.getNotifications(user.id);
      setNotifications(notifs);

      const unread = await notificationService.getUnreadCount(user.id);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      await notificationService.markAsRead(user.id, notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await notificationService.markAllAsRead(user.id);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="notification-panel">
      <div className="header">
        <h2>Notifications</h2>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            className={`notification ${notif.read ? 'read' : 'unread'}`}
            onClick={() => markAsRead(notif.id)}
          >
            <div className="icon">{notif.icon}</div>
            <div className="content">
              <h3>{notif.title}</h3>
              <p>{notif.message}</p>
              <span className="time">
                {new Date(notif.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 6. Settings Panel Integration

Update `components/Panels/SettingsPanel.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { syncService, notificationService, analyticsService } from '@/src/services';
import { useStore } from '@/store/useStore';

export const SettingsPanel: React.FC = () => {
  const { user } = useStore();
  const [syncStatus, setSyncStatus] = useState(null);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      // Load sync status
      const status = syncService.getSyncStatus(user.id);
      setSyncStatus(status);

      // Load reminders
      const userReminders = await notificationService.getReminders(user.id);
      setReminders(userReminders);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const forceSync = async () => {
    if (!user) return;

    try {
      await syncService.forceSyncNow(user.id);
      await loadSettings();
      alert('Sync complete!');
    } catch (error) {
      console.error('Error syncing:', error);
      alert('Sync failed');
    }
  };

  const createReminder = async (reminderData: any) => {
    if (!user) return;

    try {
      await notificationService.createReminder({
        userId: user.id,
        ...reminderData
      });
      await loadSettings();
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const exportData = async () => {
    if (!user) return;

    try {
      const data = await analyticsService.exportData(user.id);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindhangar-data-${Date.now()}.json`;
      a.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <div className="settings-panel">
      <section className="sync-section">
        <h2>Sync</h2>
        {syncStatus && (
          <>
            <p>Last sync: {syncService.getTimeSinceLastSync(user.id)}</p>
            <p>Pending changes: {syncStatus.pendingChanges}</p>
            <button onClick={forceSync} disabled={syncStatus.isSyncing}>
              {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </>
        )}
      </section>

      <section className="reminders-section">
        <h2>Study Reminders</h2>
        {reminders.map(reminder => (
          <div key={reminder.id} className="reminder">
            <span>{reminder.title}</span>
            <span>{reminder.time}</span>
          </div>
        ))}
        <button onClick={() => createReminder({
          title: 'Daily Study',
          time: '18:00',
          days: [1,2,3,4,5],
          enabled: true,
          sound: true
        })}>
          Add Reminder
        </button>
      </section>

      <section className="data-section">
        <h2>Data</h2>
        <button onClick={exportData}>
          Export My Data
        </button>
      </section>
    </div>
  );
};
```

---

## 7. Video Panel Integration

Update `components/Panels/VideoPanel.tsx`:

```typescript
import React, { useState } from 'react';
import { contentService, progressService, analyticsService } from '@/src/services';
import { bandwidthOptimizer } from '@/src/services';
import { useStore } from '@/store/useStore';

export const VideoPanel: React.FC = () => {
  const { user } = useStore();
  const [videoId, setVideoId] = useState('');
  const [startTime, setStartTime] = useState(Date.now());

  const loadVideo = async (id: string) => {
    if (!user) return;

    setVideoId(id);
    setStartTime(Date.now());

    // Get optimized URL
    const optimizedUrl = bandwidthOptimizer.optimizeYouTubeUrl(id);

    // Track analytics
    await analyticsService.trackContentInteraction(
      user.id,
      id,
      'video',
      'view'
    );

    // Track data usage
    bandwidthOptimizer.trackDataUsage(5 * 1024 * 1024, 'videos'); // Estimate 5MB
  };

  const completeVideo = async () => {
    if (!user || !videoId) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      // Update progress
      await progressService.updateProgress(
        user.id,
        videoId,
        'en',
        {
          status: 'completed',
          timeSpent
        }
      );

      // Track analytics
      await analyticsService.trackContentInteraction(
        user.id,
        videoId,
        'video',
        'complete'
      );
    } catch (error) {
      console.error('Error completing video:', error);
    }
  };

  return (
    <div className="video-panel">
      {/* Video player UI */}
    </div>
  );
};
```

---

## 8. Focus Panel Integration

Update `components/Panels/FocusPanel.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { progressService, analyticsService } from '@/src/services';
import { useStore } from '@/store/useStore';

export const FocusPanel: React.FC = () => {
  const { user } = useStore();
  const [session, setSession] = useState(null);
  const [distractions, setDistractions] = useState(0);

  const startFocusSession = async () => {
    if (!user) return;

    try {
      const newSession = await progressService.startSession(user.id);
      setSession(newSession);
      setDistractions(0);

      // Track analytics
      await analyticsService.trackEvent(
        user.id,
        'focus_session_start',
        { sessionId: newSession.id }
      );
    } catch (error) {
      console.error('Error starting focus session:', error);
    }
  };

  const endFocusSession = async () => {
    if (!user || !session) return;

    try {
      const completedSession = await progressService.endSession(session.id);

      if (completedSession) {
        // Track analytics
        await analyticsService.trackStudySession(
          user.id,
          completedSession.duration,
          completedSession.focusScore,
          completedSession.distractions,
          completedSession.contentIds
        );

        // Update daily goal
        await progressService.updateDailyGoal(
          user.id,
          Math.floor(completedSession.duration / 60)
        );
      }

      setSession(null);
    } catch (error) {
      console.error('Error ending focus session:', error);
    }
  };

  const recordDistraction = async () => {
    if (!user || !session) return;

    try {
      await progressService.recordDistraction(session.id);
      setDistractions(prev => prev + 1);
    } catch (error) {
      console.error('Error recording distraction:', error);
    }
  };

  return (
    <div className="focus-panel">
      {session ? (
        <>
          <h2>Focus Session Active</h2>
          <p>Distractions: {distractions}</p>
          <button onClick={endFocusSession}>End Session</button>
        </>
      ) : (
        <button onClick={startFocusSession}>Start Focus Session</button>
      )}
    </div>
  );
};
```

---

## 9. Error Handling Pattern

Use this pattern for all service calls:

```typescript
const handleServiceCall = async () => {
  if (!user) {
    console.warn('User not logged in');
    return;
  }

  try {
    // Service call
    const result = await someService.someMethod(user.id, ...args);
    
    // Success handling
    console.log('Success:', result);
    
    // Update UI
    setState(result);
    
  } catch (error) {
    // Error handling
    console.error('Error:', error);
    
    // Track error
    await analyticsService.trackError(
      user.id,
      error as Error,
      'ComponentName.handleServiceCall'
    );
    
    // Show user-friendly message
    alert('Something went wrong. Please try again.');
  }
};
```

---

## 10. Testing Integration

Example test for service integration:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { NotesPanel } from './NotesPanel';
import { contentService } from '@/src/services';

// Mock the service
jest.mock('@/src/services', () => ({
  contentService: {
    getContentByType: jest.fn(),
    createNote: jest.fn(),
  },
}));

describe('NotesPanel', () => {
  it('loads notes on mount', async () => {
    const mockNotes = [
      { id: '1', title: 'Test Note', type: 'note' }
    ];

    (contentService.getContentByType as jest.Mock).mockResolvedValue(mockNotes);

    render(<NotesPanel />);

    await waitFor(() => {
      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });
  });
});
```

---

## Summary

✅ **5 Services Integrated**
✅ **8 Components Updated**
✅ **Error Handling Patterns**
✅ **Analytics Tracking**
✅ **Progress Tracking**
✅ **Offline Support**

Your backend services are now fully integrated and ready to use! 🚀
