import { pgTable, text, timestamp, integer, boolean, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * Users table - stores user authentication and profile information
 */
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  password: text('password'), // Hashed password for email/password auth (null for OAuth)
  emailVerified: timestamp('email_verified'), // Email verification timestamp
  provider: text('provider'), // 'google' | 'github' | 'credentials' (null for email/password)
  providerId: text('provider_id'), // OAuth provider's user ID (null for email/password)
  
  // Profile fields
  preferredLanguage: text('preferred_language').notNull().default('en'),
  region: text('region').notNull().default('north'),
  educationalBoard: text('educational_board'),
  grade: integer('grade'),
  competitiveExams: jsonb('competitive_exams'), // Array of exam codes
  culturalContext: jsonb('cultural_context'),
  
  // OAuth tokens (encrypted)
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),
  
  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  providerIdx: index('idx_users_provider').on(table.provider, table.providerId),
  uniqueProviderUser: uniqueIndex('unique_provider_user').on(table.provider, table.providerId),
}));

/**
 * Accounts table - stores OAuth provider account information (NextAuth)
 */
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'oauth' | 'email' | 'credentials'
  provider: text('provider').notNull(), // 'google' | 'github'
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => ({
  userIdIdx: index('idx_accounts_user_id').on(table.userId),
  providerIdx: uniqueIndex('unique_provider_account').on(table.provider, table.providerAccountId),
}));

/**
 * Sessions table - stores user sessions for authentication (NextAuth)
 */
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  userIdIdx: index('idx_sessions_user_id').on(table.userId),
  tokenIdx: index('idx_sessions_token').on(table.sessionToken),
}));

/**
 * Verification tokens table - for email verification (NextAuth)
 */
export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  identifierTokenIdx: uniqueIndex('unique_identifier_token').on(table.identifier, table.token),
}));

/**
 * Courses table - stores user-created courses
 */
export const courses = pgTable('courses', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  level: text('level').notNull(), // 'beginner' | 'intermediate' | 'advanced' | 'research'
  
  // Sync metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  syncedAt: timestamp('synced_at'),
  isDeleted: boolean('is_deleted').default(false),
}, (table) => ({
  userIdIdx: index('idx_courses_user_id').on(table.userId),
  updatedIdx: index('idx_courses_updated').on(table.updatedAt),
}));

/**
 * Course videos table - stores videos within courses
 */
export const courseVideos = pgTable('course_videos', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  videoId: text('video_id').notNull(), // YouTube video ID
  title: text('title').notNull(),
  duration: integer('duration'), // seconds
  orderIndex: integer('order_index').notNull(),
  transcript: text('transcript'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  courseIdIdx: index('idx_course_videos_course_id').on(table.courseId),
}));

/**
 * User progress table - tracks video completion progress
 */
export const userProgress = pgTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  videoId: text('video_id').notNull(),
  
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  
  // Sync metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  syncedAt: timestamp('synced_at'),
}, (table) => ({
  userIdIdx: index('idx_user_progress_user_id').on(table.userId),
  courseIdIdx: index('idx_user_progress_course_id').on(table.courseId),
  uniqueUserVideo: uniqueIndex('unique_user_video').on(table.userId, table.courseId, table.videoId),
}));

/**
 * Sync log table - tracks data synchronization operations
 */
export const syncLog = pgTable('sync_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  syncType: text('sync_type').notNull(), // 'full' | 'incremental'
  status: text('status').notNull(), // 'success' | 'partial' | 'failed'
  
  // Sync statistics
  itemsSynced: integer('items_synced').default(0),
  conflictsDetected: integer('conflicts_detected').default(0),
  errors: jsonb('errors'),
  
  // Timing
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  durationMs: integer('duration_ms'),
}, (table) => ({
  userIdIdx: index('idx_sync_log_user_id').on(table.userId),
  startedIdx: index('idx_sync_log_started').on(table.startedAt),
}));

// Type exports for use in application code
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type CourseVideo = typeof courseVideos.$inferSelect;
export type NewCourseVideo = typeof courseVideos.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;
export type SyncLog = typeof syncLog.$inferSelect;
export type NewSyncLog = typeof syncLog.$inferInsert;
