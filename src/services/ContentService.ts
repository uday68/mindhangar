/**
 * Content Service - Manages educational content with localization
 * Handles CRUD operations for notes, videos, quizzes, and study materials
 */

import { DatabaseManager } from '../db';
import { bandwidthOptimizer } from './BandwidthOptimizer';
import { offlineSyncService } from './OfflineSyncService';

export interface Content {
  id: string;
  type: 'note' | 'video' | 'quiz' | 'flashcard' | 'roadmap';
  title: string;
  description?: string;
  data: any;
  language: string;
  userId: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoContent {
  id: string;
  url: string;
  title: string;
  summary?: string;
  transcript?: string;
  duration?: number;
  thumbnailUrl?: string;
}

export interface QuizContent {
  id: string;
  title: string;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  timeLimit?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface NoteContent {
  id: string;
  title: string;
  blocks: NoteBlock[];
  tags: string[];
}

export interface NoteBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'bullet' | 'todo' | 'code' | 'quote';
  content: string;
  completed?: boolean; // for todos
}

class ContentService {
  /**
   * Create new content
   */
  async createContent(content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Promise<Content> {
    const newContent: Content = {
      ...content,
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to offline storage
    await offlineSyncService.saveNote({
      id: newContent.id,
      content: JSON.stringify(newContent),
    });

    // Track data usage
    const dataSize = JSON.stringify(newContent).length;
    bandwidthOptimizer.trackDataUsage(dataSize, 'other');

    return newContent;
  }

  /**
   * Get content by ID with localization
   */
  async getContent(contentId: string, language: string): Promise<Content | null> {
    try {
      const content = await DatabaseManager.getLocalizedContent(contentId, language);
      
      if (content) {
        bandwidthOptimizer.trackDataUsage(JSON.stringify(content).length, 'other');
      }

      return content as Content | null;
    } catch (error) {
      console.error('Error fetching content:', error);
      return null;
    }
  }

  /**
   * Update existing content
   */
  async updateContent(contentId: string, updates: Partial<Content>): Promise<Content | null> {
    const existing = await this.getContent(contentId, updates.language || 'en');
    
    if (!existing) {
      return null;
    }

    const updated: Content = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    // Save to offline storage
    await offlineSyncService.saveNote({
      id: updated.id,
      content: JSON.stringify(updated),
    });

    return updated;
  }

  /**
   * Delete content
   */
  async deleteContent(contentId: string): Promise<boolean> {
    try {
      // In a real implementation, this would delete from the database
      console.log(`Deleting content: ${contentId}`);
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  }

  /**
   * Search content by query
   */
  async searchContent(query: string, language: string, userId: string): Promise<Content[]> {
    try {
      // In a real implementation, this would use full-text search
      // For now, return empty array
      console.log(`Searching for: ${query} in ${language} for user ${userId}`);
      return [];
    } catch (error) {
      console.error('Error searching content:', error);
      return [];
    }
  }

  /**
   * Get user's content by type
   */
  async getContentByType(
    userId: string,
    type: Content['type'],
    language: string,
    limit: number = 20
  ): Promise<Content[]> {
    try {
      // In a real implementation, this would query the database
      console.log(`Fetching ${type} content for user ${userId} in ${language}`);
      return [];
    } catch (error) {
      console.error('Error fetching content by type:', error);
      return [];
    }
  }

  /**
   * Cache content for offline use
   */
  async cacheForOffline(
    userId: string,
    contentId: string,
    language: string,
    priority: number = 1
  ): Promise<void> {
    const content = await this.getContent(contentId, language);
    
    if (!content) {
      throw new Error('Content not found');
    }

    await DatabaseManager.cacheContentForOffline(
      userId,
      contentId,
      language,
      content,
      priority
    );
  }

  /**
   * Get offline cached content
   */
  async getOfflineContent(userId: string, language: string): Promise<Content[]> {
    try {
      const cached = await DatabaseManager.getOfflineContent(userId, language);
      return cached.map((item: any) => item.content as Content);
    } catch (error) {
      console.error('Error fetching offline content:', error);
      return [];
    }
  }

  /**
   * Optimize video URL for bandwidth
   */
  optimizeVideoUrl(videoId: string): string {
    return bandwidthOptimizer.optimizeYouTubeUrl(videoId);
  }

  /**
   * Create note content
   */
  async createNote(
    userId: string,
    title: string,
    blocks: NoteBlock[],
    language: string,
    tags: string[] = []
  ): Promise<Content> {
    const noteContent: NoteContent = {
      id: `note_${Date.now()}`,
      title,
      blocks,
      tags,
    };

    return this.createContent({
      type: 'note',
      title,
      data: noteContent,
      language,
      userId,
      tags,
    });
  }

  /**
   * Create video content
   */
  async createVideo(
    userId: string,
    videoData: VideoContent,
    language: string
  ): Promise<Content> {
    // Optimize video URL for bandwidth
    const optimizedUrl = this.optimizeVideoUrl(videoData.url);
    
    const optimizedVideo: VideoContent = {
      ...videoData,
      url: optimizedUrl,
    };

    return this.createContent({
      type: 'video',
      title: videoData.title,
      description: videoData.summary,
      data: optimizedVideo,
      language,
      userId,
    });
  }

  /**
   * Create quiz content
   */
  async createQuiz(
    userId: string,
    quizData: QuizContent,
    language: string
  ): Promise<Content> {
    return this.createContent({
      type: 'quiz',
      title: quizData.title,
      description: `${quizData.difficulty} quiz on ${quizData.topic}`,
      data: quizData,
      language,
      userId,
      tags: [quizData.topic, quizData.difficulty],
    });
  }

  /**
   * Get content statistics
   */
  async getContentStats(userId: string): Promise<{
    totalNotes: number;
    totalVideos: number;
    totalQuizzes: number;
    totalFlashcards: number;
    totalSize: number;
  }> {
    // In a real implementation, this would query the database
    return {
      totalNotes: 0,
      totalVideos: 0,
      totalQuizzes: 0,
      totalFlashcards: 0,
      totalSize: 0,
    };
  }
}

export const contentService = new ContentService();
