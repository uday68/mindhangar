import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dbQueries } from './queries';
import { getDB } from './index';
import type { User, Page, Block, LearnerProfile, AppSettings, Notification } from '../types';

// Mock the database
vi.mock('./index', () => ({
  getDB: vi.fn()
}));

describe('Database Queries', () => {
  let mockDB: any;

  beforeEach(() => {
    // Create mock database with common methods
    mockDB = {
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 'test-id' }]))
        }))
      })),
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([{ id: 'test-id' }])),
          orderBy: vi.fn(() => Promise.resolve([]))
        }))
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 'test-id' }]))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve())
      }))
    };

    (getDB as any).mockReturnValue(mockDB);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('User Queries', () => {
    describe('create', () => {
      it('should create a new user', async () => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'https://example.com/avatar.jpg',
          provider: 'google' as const,
          accessToken: 'token',
          refreshToken: 'refresh',
          isPro: false
        };

        mockDB.insert.mockReturnValue({
          values: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 'user-1', ...userData }]))
          }))
        });

        const result = await dbQueries.users.create(userData);

        expect(mockDB.insert).toHaveBeenCalled();
        expect(result).toHaveProperty('id');
      });

      it('should handle creation errors', async () => {
        mockDB.insert.mockReturnValue({
          values: vi.fn(() => ({
            returning: vi.fn(() => Promise.reject(new Error('Database error')))
          }))
        });

        await expect(dbQueries.users.create({
          name: 'Test',
          email: 'test@example.com',
          avatar: '',
          provider: 'google',
          accessToken: '',
          refreshToken: ''
        })).rejects.toThrow();
      });
    });

    describe('findById', () => {
      it('should find user by id', async () => {
        const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' };
        
        mockDB.select.mockReturnValue({
          from: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([mockUser]))
          }))
        });

        const result = await dbQueries.users.findById('user-1');

        expect(result).toEqual(mockUser);
      });
    });

    describe('findByEmail', () => {
      it('should find user by email', async () => {
        const mockUser = { id: 'user-1', email: 'test@example.com' };
        
        mockDB.select.mockReturnValue({
          from: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([mockUser]))
          }))
        });

        const result = await dbQueries.users.findByEmail('test@example.com');

        expect(result).toEqual(mockUser);
      });
    });

    describe('update', () => {
      it('should update user', async () => {
        const updates = { name: 'Updated Name' };
        
        mockDB.update.mockReturnValue({
          set: vi.fn(() => ({
            where: vi.fn(() => ({
              returning: vi.fn(() => Promise.resolve([{ id: 'user-1', ...updates }]))
            }))
          }))
        });

        const result = await dbQueries.users.update('user-1', updates);

        expect(result).toHaveProperty('name', 'Updated Name');
      });
    });

    describe('delete', () => {
      it('should delete user', async () => {
        mockDB.delete.mockReturnValue({
          where: vi.fn(() => Promise.resolve())
        });

        await expect(dbQueries.users.delete('user-1')).resolves.not.toThrow();
      });
    });
  });

  describe('Page Queries', () => {
    describe('create', () => {
      it('should create a new page', async () => {
        const pageData = {
          title: 'Test Page',
          icon: '📄',
          userId: 'user-1'
        };

        mockDB.insert.mockReturnValue({
          values: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ 
              id: 'page-1', 
              ...pageData,
              createdAt: new Date(),
              updatedAt: new Date()
            }]))
          }))
        });

        const result = await dbQueries.pages.create(pageData);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('title', 'Test Page');
      });
    });

    describe('findAll', () => {
      it('should find all pages for user', async () => {
        const mockPages = [
          { id: 'page-1', title: 'Page 1', userId: 'user-1' },
          { id: 'page-2', title: 'Page 2', userId: 'user-1' }
        ];

        mockDB.select.mockReturnValue({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn(() => Promise.resolve(mockPages))
            }))
          }))
        });

        const result = await dbQueries.pages.findAll('user-1');

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('title', 'Page 1');
      });
    });

    describe('update', () => {
      it('should update page', async () => {
        const updates = { title: 'Updated Title' };
        
        mockDB.update.mockReturnValue({
          set: vi.fn(() => ({
            where: vi.fn(() => ({
              returning: vi.fn(() => Promise.resolve([{ 
                id: 'page-1', 
                ...updates,
                updatedAt: new Date()
              }]))
            }))
          }))
        });

        const result = await dbQueries.pages.update('page-1', updates);

        expect(result).toHaveProperty('title', 'Updated Title');
      });
    });

    describe('delete', () => {
      it('should delete page and associated blocks', async () => {
        mockDB.delete.mockReturnValue({
          where: vi.fn(() => Promise.resolve())
        });

        await expect(dbQueries.pages.delete('page-1')).resolves.not.toThrow();
        
        // Should be called twice: once for blocks, once for page
        expect(mockDB.delete).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Block Queries', () => {
    describe('create', () => {
      it('should create a new block', async () => {
        const blockData = {
          type: 'text' as const,
          content: 'Test content',
          pageId: 'page-1'
        };

        mockDB.insert.mockReturnValue({
          values: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ 
              id: 'block-1', 
              ...blockData,
              order: 0
            }]))
          }))
        });

        const result = await dbQueries.blocks.create(blockData);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('content', 'Test content');
      });
    });

    describe('findByPageId', () => {
      it('should find all blocks for page', async () => {
        const mockBlocks = [
          { id: 'block-1', type: 'text', content: 'Block 1', pageId: 'page-1' },
          { id: 'block-2', type: 'text', content: 'Block 2', pageId: 'page-1' }
        ];

        mockDB.select.mockReturnValue({
          from: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve(mockBlocks))
          }))
        });

        const result = await dbQueries.blocks.findByPageId('page-1');

        expect(result).toHaveLength(2);
      });
    });

    describe('update', () => {
      it('should update block', async () => {
        const updates = { content: 'Updated content' };
        
        mockDB.update.mockReturnValue({
          set: vi.fn(() => ({
            where: vi.fn(() => ({
              returning: vi.fn(() => Promise.resolve([{ 
                id: 'block-1', 
                ...updates
              }]))
            }))
          }))
        });

        const result = await dbQueries.blocks.update('block-1', updates);

        expect(result).toHaveProperty('content', 'Updated content');
      });
    });

    describe('delete', () => {
      it('should delete block', async () => {
        mockDB.delete.mockReturnValue({
          where: vi.fn(() => Promise.resolve())
        });

        await expect(dbQueries.blocks.delete('block-1')).resolves.not.toThrow();
      });
    });
  });

  describe('Settings Queries', () => {
    describe('get', () => {
      it('should get user settings', async () => {
        const mockSettings = {
          userId: 'user-1',
          apiKey: 'test-key',
          username: 'Test User',
          enableCamera: true,
          theme: 'light'
        };

        mockDB.select.mockReturnValue({
          from: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([mockSettings]))
          }))
        });

        const result = await dbQueries.settings.get('user-1');

        expect(result).toEqual(mockSettings);
      });
    });

    describe('upsert', () => {
      it('should create settings if not exist', async () => {
        const settingsData = {
          apiKey: 'new-key',
          username: 'New User'
        };

        // Mock get to return undefined (no existing settings)
        mockDB.select.mockReturnValue({
          from: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([]))
          }))
        });

        mockDB.insert.mockReturnValue({
          values: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ 
              userId: 'user-1',
              ...settingsData
            }]))
          }))
        });

        const result = await dbQueries.settings.upsert('user-1', settingsData);

        expect(mockDB.insert).toHaveBeenCalled();
        expect(result).toHaveProperty('apiKey', 'new-key');
      });

      it('should update settings if exist', async () => {
        const settingsData = {
          apiKey: 'updated-key'
        };

        // Mock get to return existing settings
        mockDB.select.mockReturnValue({
          from: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([{ userId: 'user-1', apiKey: 'old-key' }]))
          }))
        });

        mockDB.update.mockReturnValue({
          set: vi.fn(() => ({
            where: vi.fn(() => ({
              returning: vi.fn(() => Promise.resolve([{ 
                userId: 'user-1',
                ...settingsData
              }]))
            }))
          }))
        });

        const result = await dbQueries.settings.upsert('user-1', settingsData);

        expect(mockDB.update).toHaveBeenCalled();
        expect(result).toHaveProperty('apiKey', 'updated-key');
      });
    });
  });

  describe('Notification Queries', () => {
    describe('create', () => {
      it('should create notification', async () => {
        const notificationData = {
          type: 'info' as const,
          title: 'Test Notification',
          message: 'Test message'
        };

        mockDB.insert.mockReturnValue({
          values: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ 
              id: 'notif-1',
              userId: 'user-1',
              ...notificationData,
              read: false,
              timestamp: new Date()
            }]))
          }))
        });

        const result = await dbQueries.notifications.create('user-1', notificationData);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('title', 'Test Notification');
      });
    });

    describe('findAll', () => {
      it('should find all notifications for user', async () => {
        const mockNotifications = [
          { id: 'notif-1', title: 'Notification 1', userId: 'user-1' },
          { id: 'notif-2', title: 'Notification 2', userId: 'user-1' }
        ];

        mockDB.select.mockReturnValue({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn(() => Promise.resolve(mockNotifications))
            }))
          }))
        });

        const result = await dbQueries.notifications.findAll('user-1');

        expect(result).toHaveLength(2);
      });
    });

    describe('markRead', () => {
      it('should mark notification as read', async () => {
        mockDB.update.mockReturnValue({
          set: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve())
          }))
        });

        await expect(dbQueries.notifications.markRead('notif-1')).resolves.not.toThrow();
      });
    });

    describe('deleteAll', () => {
      it('should delete all notifications for user', async () => {
        mockDB.delete.mockReturnValue({
          where: vi.fn(() => Promise.resolve())
        });

        await expect(dbQueries.notifications.deleteAll('user-1')).resolves.not.toThrow();
      });
    });
  });

  describe('Learner Profile Queries', () => {
    describe('create', () => {
      it('should create learner profile', async () => {
        const profileData: LearnerProfile = {
          academicLevel: 'Class 10',
          major: 'Science',
          keyGoals: ['JEE Preparation', 'Board Exams'],
          mobilePaired: false
        };

        mockDB.insert.mockReturnValue({
          values: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ 
              userId: 'user-1',
              ...profileData,
              keyGoals: JSON.stringify(profileData.keyGoals)
            }]))
          }))
        });

        const result = await dbQueries.learnerProfiles.create('user-1', profileData);

        expect(result).toHaveProperty('academicLevel', 'Class 10');
      });
    });

    describe('get', () => {
      it('should get learner profile', async () => {
        const mockProfile = {
          userId: 'user-1',
          academicLevel: 'Class 10',
          major: 'Science',
          keyGoals: '["JEE Preparation"]',
          mobilePaired: false
        };

        mockDB.select.mockReturnValue({
          from: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([mockProfile]))
          }))
        });

        const result = await dbQueries.learnerProfiles.get('user-1');

        expect(result).toEqual(mockProfile);
      });
    });

    describe('update', () => {
      it('should update learner profile', async () => {
        const updates = {
          academicLevel: 'Class 11',
          keyGoals: ['NEET Preparation']
        };

        mockDB.update.mockReturnValue({
          set: vi.fn(() => ({
            where: vi.fn(() => ({
              returning: vi.fn(() => Promise.resolve([{ 
                userId: 'user-1',
                ...updates,
                keyGoals: JSON.stringify(updates.keyGoals)
              }]))
            }))
          }))
        });

        const result = await dbQueries.learnerProfiles.update('user-1', updates);

        expect(result).toHaveProperty('academicLevel', 'Class 11');
      });
    });
  });
});
