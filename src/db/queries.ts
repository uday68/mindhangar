// Database query functions to connect Drizzle to Zustand
import { getDB } from './index';
import { users, learnerProfiles, pages, blocks, videos, quizzes, flashcards, focusSessions, notifications, settings } from './schema';
import { eq, desc } from 'drizzle-orm';
import type { User, Page, Block, VideoResource, QuizQuestion, Flashcard, FocusSession, Notification, AppSettings, LearnerProfile } from '../types';
import { errorService, ErrorCode } from '../services/ErrorService';

// Helper to handle database errors
function handleDBError(error: any, operation: string) {
  console.error(`Database error during ${operation}:`, error);
  throw errorService.createError(
    ErrorCode.DATABASE_ERROR,
    `Database ${operation} failed`,
    'An error occurred while accessing the database. Please try again.',
    error,
    true
  );
}

// ============================================
// USER QUERIES
// ============================================

export const userQueries = {
  async create(userData: Omit<User, 'id' | 'joinedAt'>) {
    try {
      const db = getDB();
      const [user] = await db.insert(users).values({
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        provider: userData.provider,
        accessToken: userData.accessToken,
        refreshToken: userData.refreshToken,
        isPro: userData.isPro || false,
      }).returning();
      return user;
    } catch (error) {
      handleDBError(error, 'user creation');
    }
  },

  async findById(id: string) {
    try {
      const db = getDB();
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      handleDBError(error, 'user lookup');
    }
  },

  async findByEmail(email: string) {
    try {
      const db = getDB();
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      handleDBError(error, 'user lookup');
    }
  },

  async update(id: string, data: Partial<User>) {
    try {
      const db = getDB();
      const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
      return updated;
    } catch (error) {
      handleDBError(error, 'user update');
    }
  },

  async delete(id: string) {
    try {
      const db = getDB();
      await db.delete(users).where(eq(users.id, id));
    } catch (error) {
      handleDBError(error, 'user deletion');
    }
  }
};

// ============================================
// PAGE QUERIES
// ============================================

export const pageQueries = {
  async create(pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }) {
    try {
      const db = getDB();
      const [page] = await db.insert(pages).values({
        title: pageData.title,
        icon: pageData.icon,
        coverImage: pageData.coverImage,
        parentId: pageData.parentId,
        userId: pageData.userId,
      }).returning();
      return page;
    } catch (error) {
      handleDBError(error, 'page creation');
    }
  },

  async findAll(userId: string) {
    try {
      const db = getDB();
      return await db.select().from(pages).where(eq(pages.userId, userId)).orderBy(desc(pages.updatedAt));
    } catch (error) {
      handleDBError(error, 'page retrieval');
    }
  },

  async findById(id: string) {
    try {
      const db = getDB();
      const [page] = await db.select().from(pages).where(eq(pages.id, id));
      return page;
    } catch (error) {
      handleDBError(error, 'page lookup');
    }
  },

  async update(id: string, data: Partial<Page>) {
    try {
      const db = getDB();
      const [updated] = await db.update(pages).set({
        ...data,
        updatedAt: new Date(),
      }).where(eq(pages.id, id)).returning();
      return updated;
    } catch (error) {
      handleDBError(error, 'page update');
    }
  },

  async delete(id: string) {
    try {
      const db = getDB();
      // Delete associated blocks first
      await db.delete(blocks).where(eq(blocks.pageId, id));
      // Then delete page
      await db.delete(pages).where(eq(pages.id, id));
    } catch (error) {
      handleDBError(error, 'page deletion');
    }
  }
};

// ============================================
// BLOCK QUERIES
// ============================================

export const blockQueries = {
  async create(blockData: Omit<Block, 'id'> & { pageId: string }) {
    try {
      const db = getDB();
      const [block] = await db.insert(blocks).values({
        type: blockData.type,
        content: blockData.content,
        properties: blockData.properties ? JSON.stringify(blockData.properties) : null,
        pageId: blockData.pageId,
        order: 0, // Will be calculated
      }).returning();
      return block;
    } catch (error) {
      handleDBError(error, 'block creation');
    }
  },

  async findByPageId(pageId: string) {
    try {
      const db = getDB();
      return await db.select().from(blocks).where(eq(blocks.pageId, pageId));
    } catch (error) {
      handleDBError(error, 'block retrieval');
    }
  },

  async update(id: string, data: Partial<Block>) {
    try {
      const db = getDB();
      const [updated] = await db.update(blocks).set({
        content: data.content,
        properties: data.properties ? JSON.stringify(data.properties) : undefined,
      }).where(eq(blocks.id, id)).returning();
      return updated;
    } catch (error) {
      handleDBError(error, 'block update');
    }
  },

  async delete(id: string) {
    try {
      const db = getDB();
      await db.delete(blocks).where(eq(blocks.id, id));
    } catch (error) {
      handleDBError(error, 'block deletion');
    }
  }
};

// ============================================
// SETTINGS QUERIES
// ============================================

export const settingsQueries = {
  async get(userId: string) {
    try {
      const db = getDB();
      const [userSettings] = await db.select().from(settings).where(eq(settings.userId, userId));
      return userSettings;
    } catch (error) {
      handleDBError(error, 'settings retrieval');
    }
  },

  async upsert(userId: string, data: Partial<AppSettings>) {
    try {
      const db = getDB();
      const existing = await this.get(userId);
      
      if (existing) {
        const [updated] = await db.update(settings).set(data).where(eq(settings.userId, userId)).returning();
        return updated;
      } else {
        const [created] = await db.insert(settings).values({
          userId,
          apiKey: data.apiKey || '',
          username: data.username || '',
          enableCamera: data.enableCamera ?? true,
          theme: data.theme || 'light',
        }).returning();
        return created;
      }
    } catch (error) {
      handleDBError(error, 'settings update');
    }
  }
};

// ============================================
// NOTIFICATION QUERIES
// ============================================

export const notificationQueries = {
  async create(userId: string, notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    try {
      const db = getDB();
      const [notification] = await db.insert(notifications).values({
        userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        read: false,
      }).returning();
      return notification;
    } catch (error) {
      handleDBError(error, 'notification creation');
    }
  },

  async findAll(userId: string) {
    try {
      const db = getDB();
      return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.timestamp));
    } catch (error) {
      handleDBError(error, 'notification retrieval');
    }
  },

  async markRead(id: string) {
    try {
      const db = getDB();
      await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
    } catch (error) {
      handleDBError(error, 'notification update');
    }
  },

  async deleteAll(userId: string) {
    try {
      const db = getDB();
      await db.delete(notifications).where(eq(notifications.userId, userId));
    } catch (error) {
      handleDBError(error, 'notification deletion');
    }
  }
};

// ============================================
// FOCUS SESSION QUERIES
// ============================================

export const focusSessionQueries = {
  async create(userId: string, sessionData: { mode: 'focus' | 'break'; duration: number }) {
    try {
      const db = getDB();
      const [session] = await db.insert(focusSessions).values({
        userId,
        mode: sessionData.mode,
        duration: sessionData.duration,
        completed: false,
      }).returning();
      return session;
    } catch (error) {
      handleDBError(error, 'focus session creation');
    }
  },

  async complete(id: string, xpEarned: number) {
    try {
      const db = getDB();
      await db.update(focusSessions).set({
        completed: true,
        xpEarned,
        completedAt: new Date(),
      }).where(eq(focusSessions.id, id));
    } catch (error) {
      handleDBError(error, 'focus session completion');
    }
  },

  async findByUser(userId: string) {
    try {
      const db = getDB();
      return await db.select().from(focusSessions).where(eq(focusSessions.userId, userId)).orderBy(desc(focusSessions.startedAt));
    } catch (error) {
      handleDBError(error, 'focus session retrieval');
    }
  }
};

// ============================================
// LEARNER PROFILE QUERIES
// ============================================

export const learnerProfileQueries = {
  async create(userId: string, profileData: LearnerProfile) {
    try {
      const db = getDB();
      const [profile] = await db.insert(learnerProfiles).values({
        userId,
        academicLevel: profileData.academicLevel,
        major: profileData.major,
        keyGoals: JSON.stringify(profileData.keyGoals),
        mobilePaired: profileData.mobilePaired,
      }).returning();
      return profile;
    } catch (error) {
      handleDBError(error, 'learner profile creation');
    }
  },

  async get(userId: string) {
    try {
      const db = getDB();
      const [profile] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, userId));
      return profile;
    } catch (error) {
      handleDBError(error, 'learner profile retrieval');
    }
  },

  async update(userId: string, profileData: Partial<LearnerProfile>) {
    try {
      const db = getDB();
      const [updated] = await db.update(learnerProfiles).set({
        academicLevel: profileData.academicLevel,
        major: profileData.major,
        keyGoals: profileData.keyGoals ? JSON.stringify(profileData.keyGoals) : undefined,
        mobilePaired: profileData.mobilePaired,
      }).where(eq(learnerProfiles.userId, userId)).returning();
      return updated;
    } catch (error) {
      handleDBError(error, 'learner profile update');
    }
  }
};

// Export all queries
export const dbQueries = {
  users: userQueries,
  pages: pageQueries,
  blocks: blockQueries,
  settings: settingsQueries,
  notifications: notificationQueries,
  focusSessions: focusSessionQueries,
  learnerProfiles: learnerProfileQueries,
};

