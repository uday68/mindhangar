import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table with localization preferences
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique(),
  name: text('name').notNull(),
  preferredLanguage: text('preferred_language').notNull().default('en'),
  region: text('region').notNull().default('north'),
  educationalBoard: text('educational_board'),
  grade: integer('grade'),
  competitiveExams: text('competitive_exams'), // JSON array
  culturalContext: text('cultural_context'), // JSON object
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// Content table for base content
export const content = sqliteTable('content', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'lesson', 'quiz', 'video', etc.
  subject: text('subject').notNull(),
  topic: text('topic').notNull(),
  difficulty: text('difficulty').notNull(),
  estimatedTime: integer('estimated_time'), // in minutes
  educationalBoard: text('educational_board'),
  grade: integer('grade'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// Localized content translations
export const contentTranslations = sqliteTable('content_translations', {
  id: text('id').primaryKey(),
  contentId: text('content_id').notNull().references(() => content.id),
  language: text('language').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content').notNull(),
  examples: text('examples'), // JSON array
  culturalAdaptations: text('cultural_adaptations'), // JSON array
  translatedBy: text('translated_by').notNull().default('ai'),
  reviewStatus: text('review_status').notNull().default('pending'),
  translatedAt: integer('translated_at', { mode: 'timestamp' }).notNull(),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' })
});
// Cultural context data
export const culturalContexts = sqliteTable('cultural_contexts', {
  id: text('id').primaryKey(),
  region: text('region').notNull(),
  festivals: text('festivals').notNull(), // JSON array
  historicalFigures: text('historical_figures').notNull(), // JSON array
  geographicalReferences: text('geographical_references').notNull(), // JSON array
  culturalValues: text('cultural_values').notNull(), // JSON array
  preferredColors: text('preferred_colors').notNull(), // JSON array
  educationalTraditions: text('educational_traditions').notNull(), // JSON array
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// Assessment questions with multi-language support
export const assessmentQuestions = sqliteTable('assessment_questions', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'mcq', 'short_answer', 'essay'
  subject: text('subject').notNull(),
  topic: text('topic').notNull(),
  difficulty: text('difficulty').notNull(),
  educationalBoard: text('educational_board'),
  competitiveExam: text('competitive_exam'), // 'jee', 'neet', etc.
  correctAnswer: text('correct_answer'),
  explanation: text('explanation'),
  culturalContext: text('cultural_context'), // JSON object
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// Localized assessment question translations
export const assessmentQuestionTranslations = sqliteTable('assessment_question_translations', {
  id: text('id').primaryKey(),
  questionId: text('question_id').notNull().references(() => assessmentQuestions.id),
  language: text('language').notNull(),
  questionText: text('question_text').notNull(),
  options: text('options'), // JSON array for MCQ options
  explanation: text('explanation'),
  culturalAdaptations: text('cultural_adaptations'), // JSON array
  translatedAt: integer('translated_at', { mode: 'timestamp' }).notNull()
});

// User progress tracking
export const userProgress = sqliteTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  contentId: text('content_id').notNull().references(() => content.id),
  status: text('status').notNull(), // 'not_started', 'in_progress', 'completed'
  score: real('score'),
  timeSpent: integer('time_spent'), // in seconds
  language: text('language').notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// Offline content cache
export const offlineCache = sqliteTable('offline_cache', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  contentId: text('content_id').notNull().references(() => content.id),
  language: text('language').notNull(),
  cachedData: blob('cached_data').notNull(),
  priority: integer('priority').notNull().default(1), // 1-5, higher is more important
  cacheSize: integer('cache_size').notNull(), // in bytes
  cachedAt: integer('cached_at', { mode: 'timestamp' }).notNull(),
  lastAccessedAt: integer('last_accessed_at', { mode: 'timestamp' }).notNull()
});

// Courses table for YouTube-based courses
export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  level: text('level').notNull(), // 'beginner', 'intermediate', 'advanced', 'research'
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// Course videos table
export const courseVideos = sqliteTable('course_videos', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull().references(() => courses.id),
  videoId: text('video_id').notNull(), // YouTube video ID
  order: integer('order').notNull(),
  title: text('title').notNull(),
  duration: integer('duration'), // in seconds
  transcript: text('transcript'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// Course user progress table
export const courseUserProgress = sqliteTable('course_user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  courseId: text('course_id').notNull().references(() => courses.id),
  videoId: text('video_id').notNull(),
  completed: integer('completed').notNull().default(0), // 0 or 1
  completedAt: integer('completed_at', { mode: 'timestamp' })
});

// Quizzes table
export const quizzes = sqliteTable('quizzes', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull().references(() => courses.id),
  questionsJson: text('questions_json').notNull(), // JSON array of questions
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// Quiz attempts table
export const quizAttempts = sqliteTable('quiz_attempts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  quizId: text('quiz_id').notNull().references(() => quizzes.id),
  score: real('score').notNull(),
  answersJson: text('answers_json').notNull(), // JSON object of answers
  attemptedAt: integer('attempted_at', { mode: 'timestamp' }).notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  offlineCache: many(offlineCache)
}));

export const contentRelations = relations(content, ({ many }) => ({
  translations: many(contentTranslations),
  progress: many(userProgress),
  offlineCache: many(offlineCache)
}));

export const contentTranslationsRelations = relations(contentTranslations, ({ one }) => ({
  content: one(content, {
    fields: [contentTranslations.contentId],
    references: [content.id]
  })
}));

export const assessmentQuestionsRelations = relations(assessmentQuestions, ({ many }) => ({
  translations: many(assessmentQuestionTranslations)
}));

export const assessmentQuestionTranslationsRelations = relations(assessmentQuestionTranslations, ({ one }) => ({
  question: one(assessmentQuestions, {
    fields: [assessmentQuestionTranslations.questionId],
    references: [assessmentQuestions.id]
  })
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id]
  }),
  content: one(content, {
    fields: [userProgress.contentId],
    references: [content.id]
  })
}));

export const offlineCacheRelations = relations(offlineCache, ({ one }) => ({
  user: one(users, {
    fields: [offlineCache.userId],
    references: [users.id]
  }),
  content: one(content, {
    fields: [offlineCache.contentId],
    references: [content.id]
  })
}));