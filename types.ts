
export type PanelType = 'search' | 'video' | 'notes' | 'planner' | 'quiz' | 'focus' | 'chat' | 'notifications' | 'settings';

export interface PanelState {
  id: PanelType;
  isOpen: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface LearnerProfile {
  academicLevel: string;
  major: string;
  keyGoals: string[];
  mobilePaired: boolean;
}

// Auth & User
export type AuthProvider = 'google' | 'github' | 'email';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: AuthProvider;
  joinedAt: Date;
  profile?: LearnerProfile;
  accessToken?: string;
  refreshToken?: string;
  isPro?: boolean; // Commercial Feature
}

// MongoDB-like Document Structure (Notion Clone)
export type BlockType = 'text' | 'h1' | 'h2' | 'h3' | 'todo' | 'bullet' | 'code';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: Record<string, any>; // e.g., checked for todo
  parentId?: string;
  childrenIds?: string[]; // For nested blocks if implemented
}

export interface Page {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  blockIds: string[]; // Ordered list of blocks
  parentId?: string | null; // For nested pages
  createdAt: Date;
  updatedAt: Date;
}

// Legacy Note type - kept for compatibility if needed, but we move to Page
export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  version: number;
}

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  source: string;
  qualityScore: number;
  date: string;
  url: string;
}

export interface VideoResource {
  id: string;
  url: string;
  title: string;
  transcription?: string;
  summary?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface AppSettings {
  apiKey: string;
  username: string;
  enableCamera: boolean;
  theme: 'light' | 'dark';
}

export interface FocusSession {
  isActive: boolean;
  mode: 'focus' | 'break';
  timeLeft: number;
  totalTime: number;
}

export enum UserRole {
  STUDENT = 'STUDENT',
  EDUCATOR = 'EDUCATOR'
}

// --- Roadmap Types ---
export interface RoadmapResource {
  title: string;
  type: 'video' | 'article' | 'course';
}

export interface RoadmapModule {
  week: string; 
  title: string;
  description: string;
  topics: string[];
  resources: RoadmapResource[];
}

export interface LearningRoadmap {
  title: string;
  description: string;
  modules: RoadmapModule[];
}

// Command Palette Actions
export interface CommandAction {
  id: string;
  label: string;
  icon?: any;
  shortcut?: string[];
  perform: () => void;
  group: 'navigation' | 'action' | 'ai';
}
