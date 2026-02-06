/**
 * Notion-like Database using IndexedDB
 * Stores student data, goals, learning paths, and AI interactions
 */

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  grade: string;
  board: 'CBSE' | 'ICSE' | 'State';
  goals: LearningGoal[];
  currentPath: LearningPath | null;
  preferences: {
    language: string;
    subjects: string[];
    studyTime: number; // minutes per day
    examDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  type: 'exam' | 'skill' | 'subject' | 'career';
  priority: 'high' | 'medium' | 'low';
  deadline?: Date;
  status: 'active' | 'completed' | 'paused';
  progress: number; // 0-100
  milestones: Milestone[];
  createdAt: Date;
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
}

interface LearningPath {
  id: string;
  goalId: string;
  title: string;
  description: string;
  totalSteps: number;
  currentStep: number;
  steps: PathStep[];
  estimatedDuration: number; // days
  createdAt: Date;
  updatedAt: Date;
}

interface PathStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: 'lesson' | 'practice' | 'quiz' | 'project';
  content: string;
  resources: Resource[];
  completed: boolean;
  score?: number;
  timeSpent: number; // minutes
}

interface Resource {
  id: string;
  type: 'video' | 'article' | 'pdf' | 'quiz';
  title: string;
  url?: string;
  content?: string;
}

interface AIInteraction {
  id: string;
  studentId: string;
  type: 'onboarding' | 'guidance' | 'question' | 'feedback';
  question: string;
  answer: string;
  context: any;
  timestamp: Date;
}

interface StudySession {
  id: string;
  studentId: string;
  pathId: string;
  stepId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  completed: boolean;
  notes: string;
}

interface ContentItem {
  id: string;
  studentId: string;
  type: 'note' | 'video' | 'quiz' | 'flashcard' | 'resource';
  title: string;
  content: string;
  metadata?: any;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface LeaderboardEntry {
  studentId: string;
  name: string;
  score: number;
  rank: number;
  streak: number;
  level: number;
}

class NotionLikeDB {
  private dbName = 'MindHangarDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('students')) {
          db.createObjectStore('students', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('goals')) {
          const goalStore = db.createObjectStore('goals', { keyPath: 'id' });
          goalStore.createIndex('studentId', 'studentId', { unique: false });
        }
        if (!db.objectStoreNames.contains('paths')) {
          const pathStore = db.createObjectStore('paths', { keyPath: 'id' });
          pathStore.createIndex('goalId', 'goalId', { unique: false });
        }
        if (!db.objectStoreNames.contains('interactions')) {
          const interactionStore = db.createObjectStore('interactions', { keyPath: 'id' });
          interactionStore.createIndex('studentId', 'studentId', { unique: false });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('studentId', 'studentId', { unique: false });
        }
        if (!db.objectStoreNames.contains('content')) {
          const contentStore = db.createObjectStore('content', { keyPath: 'id' });
          contentStore.createIndex('type', 'type', { unique: false });
          contentStore.createIndex('studentId', 'studentId', { unique: false });
        }
      };
    });
  }

  // Student Profile Operations
  async saveStudent(profile: StudentProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['students'], 'readwrite');
    const store = transaction.objectStore('students');
    
    return new Promise((resolve, reject) => {
      const request = store.put(profile);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStudent(id: string): Promise<StudentProfile | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['students'], 'readonly');
    const store = transaction.objectStore('students');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Learning Goal Operations
  async saveGoal(goal: LearningGoal, studentId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['goals'], 'readwrite');
    const store = transaction.objectStore('goals');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ ...goal, studentId });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getGoals(studentId: string): Promise<LearningGoal[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['goals'], 'readonly');
    const store = transaction.objectStore('goals');
    const index = store.index('studentId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(studentId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Learning Path Operations
  async savePath(path: LearningPath): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['paths'], 'readwrite');
    const store = transaction.objectStore('paths');
    
    return new Promise((resolve, reject) => {
      const request = store.put(path);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPath(id: string): Promise<LearningPath | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['paths'], 'readonly');
    const store = transaction.objectStore('paths');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // AI Interaction Operations
  async saveInteraction(interaction: AIInteraction): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['interactions'], 'readwrite');
    const store = transaction.objectStore('interactions');
    
    return new Promise((resolve, reject) => {
      const request = store.put(interaction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getInteractions(studentId: string): Promise<AIInteraction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['interactions'], 'readonly');
    const store = transaction.objectStore('interactions');
    const index = store.index('studentId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(studentId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Study Session Operations
  async saveSession(session: StudySession): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');
    
    return new Promise((resolve, reject) => {
      const request = store.put(session);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSessions(studentId: string): Promise<StudySession[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['sessions'], 'readonly');
    const store = transaction.objectStore('sessions');
    const index = store.index('studentId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(studentId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Content Operations (for ContentService)
  async saveContent(content: ContentItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['content'], 'readwrite');
    const store = transaction.objectStore('content');
    
    return new Promise((resolve, reject) => {
      const request = store.put(content);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getContentByType(studentId: string, type: ContentItem['type']): Promise<ContentItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['content'], 'readonly');
    const store = transaction.objectStore('content');
    const index = store.index('studentId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(studentId);
      request.onsuccess = () => {
        const allContent = request.result || [];
        const filtered = allContent.filter((item: ContentItem) => item.type === type);
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async searchContent(studentId: string, query: string): Promise<ContentItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['content'], 'readonly');
    const store = transaction.objectStore('content');
    const index = store.index('studentId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(studentId);
      request.onsuccess = () => {
        const allContent = request.result || [];
        const searchLower = query.toLowerCase();
        const filtered = allContent.filter((item: ContentItem) => 
          item.title.toLowerCase().includes(searchLower) ||
          item.content.toLowerCase().includes(searchLower) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllContent(studentId: string): Promise<ContentItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['content'], 'readonly');
    const store = transaction.objectStore('content');
    const index = store.index('studentId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(studentId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteContent(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['content'], 'readwrite');
    const store = transaction.objectStore('content');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Leaderboard Operations (for ProgressService)
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['students', 'sessions'], 'readonly');
    const studentStore = transaction.objectStore('students');
    const sessionStore = transaction.objectStore('sessions');
    
    return new Promise((resolve, reject) => {
      const studentRequest = studentStore.getAll();
      
      studentRequest.onsuccess = () => {
        const students = studentRequest.result || [];
        const leaderboard: LeaderboardEntry[] = [];
        
        // Calculate scores for each student
        const promises = students.map((student: StudentProfile) => {
          return new Promise<void>((resolveStudent) => {
            const sessionIndex = sessionStore.index('studentId');
            const sessionRequest = sessionIndex.getAll(student.id);
            
            sessionRequest.onsuccess = () => {
              const sessions = sessionRequest.result || [];
              const totalTime = sessions.reduce((sum: number, s: StudySession) => sum + s.duration, 0);
              const completedSessions = sessions.filter((s: StudySession) => s.completed).length;
              
              // Calculate score (simple formula: time + completed sessions)
              const score = totalTime + (completedSessions * 100);
              const level = Math.floor(score / 1000) + 1;
              
              leaderboard.push({
                studentId: student.id,
                name: student.name,
                score,
                rank: 0, // Will be set after sorting
                streak: 0, // TODO: Calculate from sessions
                level
              });
              
              resolveStudent();
            };
            
            sessionRequest.onerror = () => resolveStudent();
          });
        });
        
        Promise.all(promises).then(() => {
          // Sort by score and assign ranks
          leaderboard.sort((a, b) => b.score - a.score);
          leaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
          });
          
          resolve(leaderboard.slice(0, limit));
        });
      };
      
      studentRequest.onerror = () => reject(studentRequest.error);
    });
  }
}

export const notionDB = new NotionLikeDB();

export type {
  StudentProfile,
  LearningGoal,
  LearningPath,
  PathStep,
  Resource,
  AIInteraction,
  StudySession,
  Milestone,
  ContentItem,
  LeaderboardEntry
};
