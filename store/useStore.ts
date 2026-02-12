import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PanelType, PanelState, Note, UserStats, Notification, AppSettings, FocusSession, User, Page, Block, BlockType, LearnerProfile, AuthProvider } from '../types';
import { authService } from '../services/authService';
import { dbQueries } from '../src/db/queries';
import { errorService, ErrorCode } from '../src/services/ErrorService';

// Polyfill for crypto.randomUUID
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface AppState {
  activePanels: Record<PanelType, PanelState>;
  focusedPanel: PanelType | null;
  togglePanel: (type: PanelType) => void;
  updatePanelPosition: (type: PanelType, data: Partial<PanelState>) => void;
  bringToFront: (type: PanelType) => void;
  resetLayout: (presetName: string) => void;
  
  // Window Management
  maximizedPanel: PanelType | null;
  toggleMaximize: (type: PanelType) => void;

  // Auth
  user: User | null;
  isLoadingAuth: boolean;
  showOnboarding: boolean;
  login: (provider: AuthProvider) => Promise<void>;
  logout: () => void;
  completeOnboarding: (profile: LearnerProfile) => void;
  upgradeToPro: () => void; // Commercial

  // MongoDB-like Store (Normalized)
  pages: Record<string, Page>;
  blocks: Record<string, Block>;
  activePageId: string | null;
  
  // Page Actions
  createPage: (parentId?: string) => void;
  setActivePage: (id: string) => void;
  updatePageTitle: (id: string, title: string) => void;
  deletePage: (id: string) => void;

  // Block Actions (Notion-like)
  addBlock: (pageId: string, type: BlockType, content?: string, afterBlockId?: string) => void;
  updateBlock: (blockId: string, content: string, properties?: any) => void;
  deleteBlock: (pageId: string, blockId: string) => void;
  
  // Global Context for AI (Commercial Feature)
  currentTranscript: string;
  setCurrentTranscript: (text: string) => void;

  // Command Palette
  isCommandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;

  // Commercial: Upgrade Modal
  isUpgradeModalOpen: boolean;
  toggleUpgradeModal: () => void;

  // Legacy (Keep for compatibility/search until fully migrated)
  notes: Note[];
  addNote: () => void;
  updateNote: (id: string, content: string, title?: string) => void;
  deleteNote: (id: string) => void;

  // Deep Focus Mode (UI Lock)
  isFocusMode: boolean;
  setFocusMode: (active: boolean) => void;

  // Global Focus Timer Session
  focusSession: FocusSession;
  startSession: (mode: 'focus' | 'break', durationSeconds: number) => void;
  stopSession: () => void;
  tickSession: () => void;

  // Gamification
  userStats: UserStats;
  addXp: (amount: number) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  clearNotifications: () => void;

  // Settings
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;

  // Marketing Tools
  marketingMode: boolean;
  toggleMarketingMode: () => void;
}

// Layout Definitions
export const LAYOUT_PRESETS: Record<string, {
  label: string;
  description: string;
  panels: Record<PanelType, Omit<PanelState, 'zIndex'>>;
}> = {
  'Studio': {
    label: 'Studio (Default)',
    description: 'Balanced 3-column workflow for planning, production, and AI coaching.',
    panels: {
      planner: { id: 'planner', x: 20, y: 20, width: 340, height: 440, isOpen: true },
      search: { id: 'search', x: 20, y: 480, width: 340, height: 380, isOpen: true },
      video: { id: 'video', x: 380, y: 20, width: 640, height: 440, isOpen: false },
      notes: { id: 'notes', x: 380, y: 480, width: 640, height: 380, isOpen: true },
      chat: { id: 'chat', x: 1040, y: 20, width: 320, height: 600, isOpen: false },
      focus: { id: 'focus', x: 1040, y: 640, width: 320, height: 220, isOpen: false },
      quiz: { id: 'quiz', x: 450, y: 100, width: 500, height: 600, isOpen: false },
      courses: { id: 'courses', x: 380, y: 20, width: 900, height: 700, isOpen: false },
      notifications: { id: 'notifications', x: 1040, y: 20, width: 320, height: 400, isOpen: false },
      settings: { id: 'settings', x: 480, y: 150, width: 400, height: 550, isOpen: false },
      dashboard: { id: 'dashboard', x: 100, y: 50, width: 1200, height: 800, isOpen: false },
      analytics: { id: 'analytics', x: 380, y: 20, width: 640, height: 500, isOpen: false },
      progress: { id: 'progress', x: 1040, y: 20, width: 340, height: 500, isOpen: false },
      predictions: { id: 'predictions', x: 380, y: 540, width: 640, height: 320, isOpen: false },
      devtools: { id: 'devtools', x: 100, y: 50, width: 900, height: 700, isOpen: false },
    }
  },
  'Cinema': {
    label: 'Cinema Mode',
    description: 'Large video player with essential note-taking tools below.',
    panels: {
      video: { id: 'video', x: 100, y: 30, width: 900, height: 550, isOpen: true },
      notes: { id: 'notes', x: 100, y: 600, width: 900, height: 250, isOpen: true },
      chat: { id: 'chat', x: 1020, y: 30, width: 300, height: 820, isOpen: true },
      planner: { id: 'planner', x: 20, y: 20, width: 340, height: 440, isOpen: false },
      search: { id: 'search', x: 20, y: 480, width: 340, height: 380, isOpen: false },
      focus: { id: 'focus', x: 1020, y: 700, width: 300, height: 200, isOpen: false },
      quiz: { id: 'quiz', x: 300, y: 100, width: 500, height: 600, isOpen: false },
      courses: { id: 'courses', x: 380, y: 20, width: 900, height: 700, isOpen: false },
      notifications: { id: 'notifications', x: 1000, y: 20, width: 300, height: 400, isOpen: false },
      settings: { id: 'settings', x: 400, y: 100, width: 400, height: 550, isOpen: false },
      dashboard: { id: 'dashboard', x: 100, y: 50, width: 1200, height: 800, isOpen: false },
      analytics: { id: 'analytics', x: 380, y: 20, width: 640, height: 500, isOpen: false },
      progress: { id: 'progress', x: 1040, y: 20, width: 340, height: 500, isOpen: false },
      predictions: { id: 'predictions', x: 380, y: 540, width: 640, height: 320, isOpen: false },
      devtools: { id: 'devtools', x: 100, y: 50, width: 900, height: 700, isOpen: false },
    }
  },
  'Research': {
    label: 'Research Desk',
    description: 'Side-by-side browser search and extensive notes.',
    panels: {
      search: { id: 'search', x: 40, y: 30, width: 450, height: 850, isOpen: true },
      notes: { id: 'notes', x: 510, y: 30, width: 550, height: 850, isOpen: true },
      chat: { id: 'chat', x: 1080, y: 30, width: 300, height: 500, isOpen: true },
      planner: { id: 'planner', x: 1080, y: 550, width: 300, height: 330, isOpen: true },
      video: { id: 'video', x: 380, y: 20, width: 640, height: 440, isOpen: false },
      focus: { id: 'focus', x: 20, y: 20, width: 300, height: 200, isOpen: false },
      quiz: { id: 'quiz', x: 400, y: 100, width: 500, height: 600, isOpen: false },
      courses: { id: 'courses', x: 380, y: 20, width: 900, height: 700, isOpen: false },
      notifications: { id: 'notifications', x: 1000, y: 20, width: 300, height: 400, isOpen: false },
      settings: { id: 'settings', x: 400, y: 100, width: 400, height: 550, isOpen: false },
      dashboard: { id: 'dashboard', x: 100, y: 50, width: 1200, height: 800, isOpen: false },
      analytics: { id: 'analytics', x: 380, y: 20, width: 640, height: 500, isOpen: false },
      progress: { id: 'progress', x: 1040, y: 20, width: 340, height: 500, isOpen: false },
      predictions: { id: 'predictions', x: 380, y: 540, width: 640, height: 320, isOpen: false },
      devtools: { id: 'devtools', x: 100, y: 50, width: 900, height: 700, isOpen: false },
    }
  },
  'AI Learning': {
    label: 'AI Learning Hub',
    description: 'Comprehensive AI dashboard with progress tracking and personalized insights.',
    panels: {
      dashboard: { id: 'dashboard', x: 100, y: 50, width: 1200, height: 800, isOpen: true },
      progress: { id: 'progress', x: 20, y: 20, width: 340, height: 500, isOpen: false },
      analytics: { id: 'analytics', x: 380, y: 20, width: 640, height: 500, isOpen: false },
      predictions: { id: 'predictions', x: 380, y: 540, width: 640, height: 320, isOpen: false },
      planner: { id: 'planner', x: 1040, y: 20, width: 340, height: 440, isOpen: false },
      notes: { id: 'notes', x: 1040, y: 480, width: 340, height: 380, isOpen: false },
      search: { id: 'search', x: 20, y: 540, width: 340, height: 320, isOpen: false },
      video: { id: 'video', x: 380, y: 20, width: 640, height: 440, isOpen: false },
      chat: { id: 'chat', x: 1040, y: 20, width: 320, height: 600, isOpen: false },
      focus: { id: 'focus', x: 1040, y: 640, width: 320, height: 220, isOpen: false },
      quiz: { id: 'quiz', x: 450, y: 100, width: 500, height: 600, isOpen: false },
      courses: { id: 'courses', x: 380, y: 20, width: 900, height: 700, isOpen: false },
      notifications: { id: 'notifications', x: 1040, y: 20, width: 320, height: 400, isOpen: false },
      settings: { id: 'settings', x: 480, y: 150, width: 400, height: 550, isOpen: false },
      devtools: { id: 'devtools', x: 100, y: 50, width: 900, height: 700, isOpen: false },
    }
  }
};

let maxZ = 100;

// Helper to initialize state
const createInitialPanels = () => {
  const preset = LAYOUT_PRESETS['Studio'].panels;
  const panels: any = {};
  Object.keys(preset).forEach(key => {
    const k = key as PanelType;
    panels[k] = { ...preset[k], zIndex: ++maxZ };
  });
  return panels;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activePanels: createInitialPanels(),
      focusedPanel: 'planner',
      maximizedPanel: null,
      
      // Auth
      user: null, // Start unauthenticated
      isLoadingAuth: false,
      showOnboarding: false,
      
      login: async (provider) => {
        set({ isLoadingAuth: true });
        
        try {
          const user = await authService.login(provider);
          
          set({
            isLoadingAuth: false,
            // START COMMERCIAL CHANGE: Defaults to Free tier to show upgrade flow
            user: { ...user, isPro: false }, 
            showOnboarding: true,
            settings: { ...get().settings, username: user.name }
          });
        } catch (error) {
          console.error("Login failed", error);
          set({ isLoadingAuth: false });
          alert("Login failed. Please try again.");
        }
      },
      
      logout: async () => {
        await authService.logout();
        set({ user: null, showOnboarding: false, activePanels: createInitialPanels(), maximizedPanel: null });
      },

      completeOnboarding: async (profile) => {
        const state = get();
        if (!state.user) return;

        try {
          // Save profile to database
          await dbQueries.learnerProfiles.create(state.user.id, profile);
          
          // Update user in database
          await dbQueries.users.update(state.user.id, {
            ...state.user,
            profile,
          });

          // Update Zustand state
          set((state) => ({
            user: state.user ? { ...state.user, profile } : null,
            showOnboarding: false,
          }));
        } catch (error) {
          console.error('Failed to complete onboarding:', error);
          // Fallback to localStorage
          set((state) => ({
            user: state.user ? { ...state.user, profile } : null,
            showOnboarding: false,
          }));
        }
      },

      upgradeToPro: () => set((state) => {
        if (!state.user) return state;
        return {
          user: { ...state.user, isPro: true },
          isUpgradeModalOpen: false,
          notifications: [{
            id: generateUUID(),
            type: 'success',
            title: 'Welcome to Pro!',
            message: 'You now have access to AI Camera, Context Chat, and Unlimited Search.',
            timestamp: new Date(),
            read: false
          }, ...state.notifications]
        }
      }),

      // Notion-like Store - Starts Empty (Dynamic)
      pages: {},
      blocks: {},
      activePageId: null,

      createPage: async (parentId) => {
        const state = get();
        if (!state.user) {
          console.warn('User not authenticated, creating page in memory only');
          const id = generateUUID();
          const blockId = generateUUID();
          set({
            pages: {
              ...state.pages,
              [id]: {
                id,
                title: 'Untitled Page',
                icon: '📄',
                blockIds: [blockId],
                parentId,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            },
            blocks: {
              ...state.blocks,
              [blockId]: { id: blockId, type: 'text', content: '' }
            },
            activePageId: id
          });
          return;
        }

        try {
          // Create in database
          const page = await dbQueries.pages.create({
            title: 'Untitled Page',
            icon: '📄',
            parentId,
            userId: state.user.id,
          });

          // Create initial block
          const block = await dbQueries.blocks.create({
            type: 'text',
            content: '',
            pageId: page.id,
          });

          // Update Zustand state
          set({
            pages: {
              ...state.pages,
              [page.id]: {
                id: page.id,
                title: page.title,
                icon: page.icon,
                blockIds: [block.id],
                parentId: page.parentId,
                createdAt: page.createdAt,
                updatedAt: page.updatedAt,
              }
            },
            blocks: {
              ...state.blocks,
              [block.id]: { id: block.id, type: block.type, content: block.content }
            },
            activePageId: page.id,
          });
        } catch (error) {
          console.error('Failed to create page:', error);
          // Fallback to localStorage
          const id = generateUUID();
          const blockId = generateUUID();
          set({
            pages: {
              ...state.pages,
              [id]: {
                id,
                title: 'Untitled Page',
                icon: '📄',
                blockIds: [blockId],
                parentId,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            },
            blocks: {
              ...state.blocks,
              [blockId]: { id: blockId, type: 'text', content: '' }
            },
            activePageId: id
          });
        }
      },

      setActivePage: (id) => set({ activePageId: id }),

      updatePageTitle: async (id, title) => {
        try {
          await dbQueries.pages.update(id, { title });
          set((state) => ({
            pages: {
              ...state.pages,
              [id]: { ...state.pages[id], title, updatedAt: new Date() }
            }
          }));
        } catch (error) {
          console.error('Failed to update page:', error);
          // Fallback to localStorage
          set((state) => ({
            pages: {
              ...state.pages,
              [id]: { ...state.pages[id], title, updatedAt: new Date() }
            }
          }));
        }
      },

      deletePage: async (id) => {
        try {
          await dbQueries.pages.delete(id);
          set((state) => {
            const newPages = { ...state.pages };
            delete newPages[id];
            return { 
              pages: newPages,
              activePageId: state.activePageId === id ? Object.keys(newPages)[0] || null : state.activePageId 
            };
          });
        } catch (error) {
          console.error('Failed to delete page:', error);
          // Fallback to localStorage
          set((state) => {
            const newPages = { ...state.pages };
            delete newPages[id];
            return { 
              pages: newPages,
              activePageId: state.activePageId === id ? Object.keys(newPages)[0] || null : state.activePageId 
            };
          });
        }
      },

      addBlock: async (pageId, type, content = '', afterBlockId) => {
        const state = get();
        if (!state.user) {
          console.warn('User not authenticated, creating block in memory only');
          const id = generateUUID();
          const newBlock: Block = { id, type, content };
          const page = state.pages[pageId];
          if (!page) return;

          const newBlockIds = [...page.blockIds];
          if (afterBlockId) {
            const idx = newBlockIds.indexOf(afterBlockId);
            if (idx !== -1) newBlockIds.splice(idx + 1, 0, id);
            else newBlockIds.push(id);
          } else {
            newBlockIds.push(id);
          }

          set({
            blocks: { ...state.blocks, [id]: newBlock },
            pages: {
              ...state.pages,
              [pageId]: { ...page, blockIds: newBlockIds, updatedAt: new Date() }
            }
          });
          return;
        }

        try {
          const block = await dbQueries.blocks.create({
            type,
            content,
            pageId,
          });

          set((state) => {
            const page = state.pages[pageId];
            if (!page) return state;

            const newBlockIds = [...page.blockIds];
            if (afterBlockId) {
              const idx = newBlockIds.indexOf(afterBlockId);
              if (idx !== -1) newBlockIds.splice(idx + 1, 0, block.id);
              else newBlockIds.push(block.id);
            } else {
              newBlockIds.push(block.id);
            }

            return {
              blocks: {
                ...state.blocks,
                [block.id]: {
                  id: block.id,
                  type: block.type,
                  content: block.content,
                  properties: block.properties ? JSON.parse(block.properties) : undefined,
                }
              },
              pages: {
                ...state.pages,
                [pageId]: {
                  ...page,
                  blockIds: newBlockIds,
                  updatedAt: new Date(),
                }
              }
            };
          });
        } catch (error) {
          console.error('Failed to add block:', error);
          // Fallback to localStorage
          const id = generateUUID();
          const newBlock: Block = { id, type, content };
          const page = state.pages[pageId];
          if (!page) return;

          const newBlockIds = [...page.blockIds];
          if (afterBlockId) {
            const idx = newBlockIds.indexOf(afterBlockId);
            if (idx !== -1) newBlockIds.splice(idx + 1, 0, id);
            else newBlockIds.push(id);
          } else {
            newBlockIds.push(id);
          }

          set({
            blocks: { ...state.blocks, [id]: newBlock },
            pages: {
              ...state.pages,
              [pageId]: { ...page, blockIds: newBlockIds, updatedAt: new Date() }
            }
          });
        }
      },

      updateBlock: async (blockId, content, properties) => {
        try {
          await dbQueries.blocks.update(blockId, { content, properties });
          set((state) => ({
            blocks: {
              ...state.blocks,
              [blockId]: { 
                ...state.blocks[blockId], 
                content, 
                properties: { ...state.blocks[blockId].properties, ...properties } 
              }
            }
          }));
        } catch (error) {
          console.error('Failed to update block:', error);
          // Fallback to localStorage
          set((state) => ({
            blocks: {
              ...state.blocks,
              [blockId]: { 
                ...state.blocks[blockId], 
                content, 
                properties: { ...state.blocks[blockId].properties, ...properties } 
              }
            }
          }));
        }
      },

      deleteBlock: async (pageId, blockId) => {
        try {
          await dbQueries.blocks.delete(blockId);
          set((state) => {
            const page = state.pages[pageId];
            if (!page) return state;
            const newBlockIds = page.blockIds.filter(id => id !== blockId);
            
            const newBlocks = { ...state.blocks };
            delete newBlocks[blockId];

            return {
              blocks: newBlocks,
              pages: {
                ...state.pages,
                [pageId]: { ...page, blockIds: newBlockIds, updatedAt: new Date() }
              }
            };
          });
        } catch (error) {
          console.error('Failed to delete block:', error);
          // Fallback to localStorage
          set((state) => {
            const page = state.pages[pageId];
            if (!page) return state;
            const newBlockIds = page.blockIds.filter(id => id !== blockId);
            
            const newBlocks = { ...state.blocks };
            delete newBlocks[blockId];

            return {
              blocks: newBlocks,
              pages: {
                ...state.pages,
                [pageId]: { ...page, blockIds: newBlockIds, updatedAt: new Date() }
              }
            };
          });
        }
      },

      // AI Context Sharing
      currentTranscript: '',
      setCurrentTranscript: (text) => set({ currentTranscript: text }),

      // Command Palette
      isCommandPaletteOpen: false,
      toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
      setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),

      // Upgrade Modal
      isUpgradeModalOpen: false,
      toggleUpgradeModal: () => set((state) => ({ isUpgradeModalOpen: !state.isUpgradeModalOpen })),

      // Legacy Notes
      notes: [],
      addNote: () => {}, 
      updateNote: () => {}, 
      deleteNote: () => {},

      isFocusMode: false,
      userStats: { xp: 120, level: 2, streak: 3 },
      notifications: [
        { id: '1', type: 'info', title: 'Welcome', message: 'Press Cmd+K to open the Command Palette.', timestamp: new Date(), read: false }
      ],
      settings: {
        apiKey: process.env.API_KEY || '',
        aiProvider: 'auto',
        ollamaBaseUrl: 'http://localhost:11434',
        ollamaModel: 'llama3.1',
        username: 'Student',
        enableCamera: true,
        theme: 'light'
      },
      focusSession: {
        isActive: false,
        mode: 'focus',
        timeLeft: 25 * 60,
        totalTime: 25 * 60
      },

      togglePanel: (type) => set((state) => {
        if (state.isFocusMode && type !== 'focus') return state;
        const panel = state.activePanels[type];
        // If closing a panel that was maximized, clear maximized state
        const wasMaximized = state.maximizedPanel === type;
        
        return {
          activePanels: { ...state.activePanels, [type]: { ...panel, isOpen: !panel.isOpen, zIndex: ++maxZ } },
          focusedPanel: !panel.isOpen ? type : state.focusedPanel,
          maximizedPanel: wasMaximized ? null : state.maximizedPanel
        };
      }),
      
      toggleMaximize: (type) => set((state) => ({
        maximizedPanel: state.maximizedPanel === type ? null : type,
        focusedPanel: type,
        activePanels: {
           ...state.activePanels,
           [type]: {
             ...state.activePanels[type],
             zIndex: state.maximizedPanel === type ? state.activePanels[type].zIndex : ++maxZ 
           }
        }
      })),

      updatePanelPosition: (type, data) => set((state) => ({
        activePanels: { ...state.activePanels, [type]: { ...state.activePanels[type], ...data } }
      })),

      bringToFront: (type) => set((state) => ({
        activePanels: { ...state.activePanels, [type]: { ...state.activePanels[type], zIndex: ++maxZ } },
        focusedPanel: type
      })),

      resetLayout: (presetName) => set((state) => {
        const preset = LAYOUT_PRESETS[presetName] || LAYOUT_PRESETS['Studio'];
        const newPanels: any = {};
        maxZ = 100;
        Object.keys(preset.panels).forEach(key => {
          const k = key as PanelType;
          const def = preset.panels[k];
          const isOpen = k === 'settings' ? true : def.isOpen;
          newPanels[k] = { ...def, isOpen, zIndex: k === 'settings' ? 200 : ++maxZ };
        });
        return { activePanels: newPanels, maximizedPanel: null };
      }),

      setFocusMode: (active) => set(() => ({ isFocusMode: active, maximizedPanel: null })),
      startSession: (mode, durationSeconds) => set(() => ({
        focusSession: { isActive: true, mode, timeLeft: durationSeconds, totalTime: durationSeconds },
        maximizedPanel: null
      })),
      stopSession: () => set((state) => ({
        focusSession: { ...state.focusSession, isActive: false },
        isFocusMode: false
      })),
      tickSession: () => {
        const { focusSession, addXp, addNotification } = get();
        if (!focusSession.isActive) return;
        if (focusSession.timeLeft > 0) {
          set({ focusSession: { ...focusSession, timeLeft: focusSession.timeLeft - 1 } });
        } else {
          const isBreak = focusSession.mode === 'break';
          const xp = isBreak ? 10 : 50;
          addXp(xp);
          addNotification({
            type: 'success',
            title: isBreak ? 'Break Over!' : 'Focus Session Complete!',
            message: isBreak ? 'Time to get back to work.' : `Great job! You earned ${xp} XP. Take a break?`
          });
          set({ focusSession: { ...focusSession, isActive: false, timeLeft: 0 }, isFocusMode: false });
        }
      },
      addXp: (amount) => set((state) => {
        const currentXp = state.userStats.xp + amount;
        const level = Math.floor(currentXp / 100) + 1;
        return { userStats: { ...state.userStats, xp: currentXp, level } };
      }),
      addNotification: async (n) => {
        const state = get();
        if (!state.user) {
          // Fallback to localStorage for unauthenticated users
          set((state) => ({
            notifications: [{ id: generateUUID(), timestamp: new Date(), read: false, ...n }, ...state.notifications]
          }));
          return;
        }

        try {
          const created = await dbQueries.notifications.create(state.user.id, n);
          set((state) => ({
            notifications: [created, ...state.notifications]
          }));
        } catch (error) {
          console.error('Failed to add notification:', error);
          // Fallback to localStorage
          set((state) => ({
            notifications: [{ id: generateUUID(), timestamp: new Date(), read: false, ...n }, ...state.notifications]
          }));
        }
      },
      markRead: (id) => set((state) => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
      clearNotifications: () => set({ notifications: [] }),
      updateSettings: async (s) => {
        const state = get();
        if (!state.user) {
          // Fallback to localStorage for unauthenticated users
          set((state) => ({ settings: { ...state.settings, ...s } }));
          return;
        }

        try {
          await dbQueries.settings.upsert(state.user.id, s);
          set((state) => ({ settings: { ...state.settings, ...s } }));
        } catch (error) {
          console.error('Failed to update settings:', error);
          // Fallback to localStorage
          set((state) => ({ settings: { ...state.settings, ...s } }));
        }
      },

      // Marketing State
      marketingMode: false,
      toggleMarketingMode: () => set((state) => ({ marketingMode: !state.marketingMode })),
    }),
    {
      name: 'mindhangar-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        pages: state.pages,
        blocks: state.blocks,
        settings: state.settings,
        userStats: state.userStats
      }),
    }
  )
);
