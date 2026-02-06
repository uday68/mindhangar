// Enhanced Zustand store with database integration
// This file shows the pattern for integrating database queries
// Copy relevant sections to useStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { dbQueries } from '../src/db/queries';
import { errorService, ErrorCode } from '../src/services/ErrorService';
import type { User, Page, Block, BlockType, LearnerProfile, Notification, AppSettings } from '../types';

// Example: Enhanced page actions with database integration
const enhancedPageActions = {
  // Create page with database persistence
  createPage: async (parentId?: string) => {
    const state = get();
    if (!state.user) {
      throw errorService.createError(
        ErrorCode.UNAUTHORIZED,
        'User not authenticated',
        'Please log in to create pages.',
        null,
        false
      );
    }

    try {
      // Create in database
      const page = await dbQueries.pages.create({
        title: 'Untitled Page',
        icon: '📄',
        parentId,
        userId: state.user.id,
      });

      // Update Zustand state
      set((state) => ({
        pages: {
          ...state.pages,
          [page.id]: {
            id: page.id,
            title: page.title,
            icon: page.icon,
            blockIds: [],
            parentId: page.parentId,
            createdAt: page.createdAt,
            updatedAt: page.updatedAt,
          }
        },
        activePageId: page.id,
      }));

      return page;
    } catch (error) {
      console.error('Failed to create page:', error);
      throw error;
    }
  },

  // Update page with database persistence
  updatePageTitle: async (id: string, title: string) => {
    try {
      await dbQueries.pages.update(id, { title });
      
      set((state) => ({
        pages: {
          ...state.pages,
          [id]: {
            ...state.pages[id],
            title,
            updatedAt: new Date(),
          }
        }
      }));
    } catch (error) {
      console.error('Failed to update page:', error);
      throw error;
    }
  },

  // Delete page with database persistence
  deletePage: async (id: string) => {
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
      throw error;
    }
  },

  // Load pages from database
  loadPages: async (userId: string) => {
    try {
      const pages = await dbQueries.pages.findAll(userId);
      const pagesMap: Record<string, Page> = {};
      
      pages.forEach(page => {
        pagesMap[page.id] = {
          id: page.id,
          title: page.title,
          icon: page.icon,
          blockIds: [], // Will be loaded separately
          parentId: page.parentId,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
        };
      });

      set({ pages: pagesMap });
    } catch (error) {
      console.error('Failed to load pages:', error);
      throw error;
    }
  },
};

// Example: Enhanced block actions with database integration
const enhancedBlockActions = {
  addBlock: async (pageId: string, type: BlockType, content: string = '', afterBlockId?: string) => {
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
      throw error;
    }
  },

  updateBlock: async (blockId: string, content: string, properties?: any) => {
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
      throw error;
    }
  },

  deleteBlock: async (pageId: string, blockId: string) => {
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
            [pageId]: {
              ...page,
              blockIds: newBlockIds,
              updatedAt: new Date(),
            }
          }
        };
      });
    } catch (error) {
      console.error('Failed to delete block:', error);
      throw error;
    }
  },
};

// Example: Enhanced user actions with database integration
const enhancedUserActions = {
  completeOnboarding: async (profile: LearnerProfile) => {
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
      throw error;
    }
  },

  updateSettings: async (settings: Partial<AppSettings>) => {
    const state = get();
    if (!state.user) return;

    try {
      await dbQueries.settings.upsert(state.user.id, settings);
      
      set((state) => ({
        settings: { ...state.settings, ...settings }
      }));
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  addNotification: async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const state = get();
    if (!state.user) return;

    try {
      const created = await dbQueries.notifications.create(state.user.id, notification);
      
      set((state) => ({
        notifications: [created, ...state.notifications]
      }));
    } catch (error) {
      console.error('Failed to add notification:', error);
      // Don't throw - notifications are not critical
    }
  },
};

// Export patterns for integration
export const databaseIntegrationPatterns = {
  pages: enhancedPageActions,
  blocks: enhancedBlockActions,
  user: enhancedUserActions,
};

// Migration helper: Sync localStorage data to database
export async function migrateLocalStorageToDatabase(userId: string) {
  try {
    const stored = localStorage.getItem('mindhangar-storage');
    if (!stored) return;

    const data = JSON.parse(stored);
    
    // Migrate pages
    if (data.state?.pages) {
      for (const page of Object.values(data.state.pages) as Page[]) {
        try {
          await dbQueries.pages.create({
            ...page,
            userId,
          });
        } catch (error) {
          console.warn('Failed to migrate page:', page.id, error);
        }
      }
    }

    // Migrate blocks
    if (data.state?.blocks) {
      for (const block of Object.values(data.state.blocks) as Block[]) {
        try {
          await dbQueries.blocks.create({
            ...block,
            pageId: block.parentId || '', // Assuming parentId is pageId
          });
        } catch (error) {
          console.warn('Failed to migrate block:', block.id, error);
        }
      }
    }

    console.log('✅ Migration complete');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
