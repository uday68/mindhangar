import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MindHangarDB extends DBSchema {
  notes: {
    key: string;
    value: {
      id: string;
      content: string;
      timestamp: number;
      synced: boolean;
    };
  };
  tasks: {
    key: string;
    value: {
      id: string;
      title: string;
      completed: boolean;
      timestamp: number;
      synced: boolean;
    };
  };
  videos: {
    key: string;
    value: {
      id: string;
      url: string;
      summary?: string;
      timestamp: number;
    };
  };
  quizzes: {
    key: string;
    value: {
      id: string;
      questions: any[];
      score?: number;
      timestamp: number;
    };
  };
}

class OfflineSyncService {
  private db: IDBPDatabase<MindHangarDB> | null = null;
  private syncQueue: Array<{ store: string; data: any }> = [];
  private isOnline: boolean = navigator.onLine;

  async init() {
    this.db = await openDB<MindHangarDB>('mindhangar-db', 1, {
      upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('quizzes')) {
          db.createObjectStore('quizzes', { keyPath: 'id' });
        }
      },
    });

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    return this.db;
  }

  private handleOnline = () => {
    this.isOnline = true;
    console.log('🟢 Back online - syncing data...');
    this.syncPendingData();
  };

  private handleOffline = () => {
    this.isOnline = false;
    console.log('🔴 Offline mode activated');
  };

  async saveNote(note: { id: string; content: string }) {
    if (!this.db) await this.init();
    
    const noteData = {
      ...note,
      timestamp: Date.now(),
      synced: this.isOnline,
    };

    await this.db!.put('notes', noteData);

    if (!this.isOnline) {
      this.syncQueue.push({ store: 'notes', data: noteData });
    }

    return noteData;
  }

  async saveTask(task: { id: string; title: string; completed: boolean }) {
    if (!this.db) await this.init();
    
    const taskData = {
      ...task,
      timestamp: Date.now(),
      synced: this.isOnline,
    };

    await this.db!.put('tasks', taskData);

    if (!this.isOnline) {
      this.syncQueue.push({ store: 'tasks', data: taskData });
    }

    return taskData;
  }

  async saveVideo(video: { id: string; url: string; summary?: string }) {
    if (!this.db) await this.init();
    
    const videoData = {
      ...video,
      timestamp: Date.now(),
    };

    await this.db!.put('videos', videoData);
    return videoData;
  }

  async saveQuiz(quiz: { id: string; questions: any[]; score?: number }) {
    if (!this.db) await this.init();
    
    const quizData = {
      ...quiz,
      timestamp: Date.now(),
    };

    await this.db!.put('quizzes', quizData);
    return quizData;
  }

  async getNotes() {
    if (!this.db) await this.init();
    return this.db!.getAll('notes');
  }

  async getTasks() {
    if (!this.db) await this.init();
    return this.db!.getAll('tasks');
  }

  async getVideos() {
    if (!this.db) await this.init();
    return this.db!.getAll('videos');
  }

  async getQuizzes() {
    if (!this.db) await this.init();
    return this.db!.getAll('quizzes');
  }

  private async syncPendingData() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    console.log(`📤 Syncing ${this.syncQueue.length} items...`);

    // In a real app, you'd send this to your backend
    // For now, we just mark them as synced
    for (const item of this.syncQueue) {
      if (item.store === 'notes' || item.store === 'tasks') {
        const data = { ...item.data, synced: true };
        await this.db!.put(item.store as any, data);
      }
    }

    this.syncQueue = [];
    console.log('✅ Sync complete');
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      pendingSync: this.syncQueue.length,
    };
  }

  destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

export const offlineSyncService = new OfflineSyncService();
