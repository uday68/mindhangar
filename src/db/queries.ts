// Database query functions using IndexedDB
import { get, put, remove, getAll, getByIndex, STORES } from './browserDB';
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
  async create(userData: any) {
    try {
      const user = {
        id: userData.id || crypto.randomUUID(),
        name: userData.name,
        email: userData.email,
        preferredLanguage: userData.preferredLanguage || 'en',
        region: userData.region || 'north',
        educationalBoard: userData.educationalBoard,
        grade: userData.grade,
        competitiveExams: userData.competitiveExams ? JSON.stringify(userData.competitiveExams) : null,
        culturalContext: userData.culturalContext ? JSON.stringify(userData.culturalContext) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await put(STORES.users, user);
      return user;
    } catch (error) {
      handleDBError(error, 'user creation');
    }
  },

  async findById(id: string) {
    try {
      return await get(STORES.users, id);
    } catch (error) {
      handleDBError(error, 'user lookup');
    }
  },

  async findByEmail(email: string) {
    try {
      const users = await getAll(STORES.users);
      return users.find((u: any) => u.email === email);
    } catch (error) {
      handleDBError(error, 'user lookup');
    }
  },

  async update(id: string, data: any) {
    try {
      const existing = await get<any>(STORES.users, id);
      if (!existing) throw new Error('User not found');
      
      const updateData: any = { ...(existing as object), ...data, updatedAt: new Date() };
      if (data.competitiveExams) updateData.competitiveExams = JSON.stringify(data.competitiveExams);
      if (data.culturalContext) updateData.culturalContext = JSON.stringify(data.culturalContext);
      
      await put(STORES.users, updateData);
      return updateData;
    } catch (error) {
      handleDBError(error, 'user update');
    }
  },

  async delete(id: string) {
    try {
      await remove(STORES.users, id);
    } catch (error) {
      handleDBError(error, 'user deletion');
    }
  }
};

// Note: The following queries are stubs for future implementation
// They reference tables that don't exist in the current schema yet

// Export all queries
export const dbQueries = {
  users: userQueries,
};

