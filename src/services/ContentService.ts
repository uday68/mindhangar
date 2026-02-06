/**
 * Content Service - Manages educational content with localization and AI classification
 * Handles CRUD operations for notes, videos, quizzes, and study materials
 * Integrates with Educational Content Model for automatic classification
 */

import { DatabaseManager } from '../db';
import { bandwidthOptimizer } from './BandwidthOptimizer';
import { offlineSyncService } from './OfflineSyncService';
import { educationalContentModel } from './ai/EducationalContentModel';
import type { ContentClassification, ContentMetadata } from './ai/EducationalContentModel';

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
  // AI-generated metadata
  classification?: ContentClassification;
  metadata?: ContentMetadata;
  aiProcessed?: boolean;
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
   * Create new content with AI classification
   */
  async createContent(content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Promise<Content> {
    const newContent: Content = {
      ...content,
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      aiProcessed: false,
    };

    // Classify content using AI model (async, non-blocking)
    this.classifyContentAsync(newContent).catch(error => {
      console.error('Failed to classify content:', error);
    });

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
   * Classify content using Educational Content Model (async)
   */
  private async classifyContentAsync(content: Content): Promise<void> {
    try {
      // Extract text content for classification
      const textContent = this.extractTextContent(content);
      
      if (!textContent || textContent.length < 50) {
        // Content too short for meaningful classification
        return;
      }

      // Classify content
      const classification = await educationalContentModel.classifyContent(
        textContent,
        content.language as any
      );

      // Extract metadata
      const metadata = await educationalContentModel.extractMetadata(
        textContent,
        content.language as any
      );

      // Update content with AI results
      await this.updateContent(content.id, {
        classification,
        metadata,
        aiProcessed: true,
        tags: [...(content.tags || []), ...classification.keywords],
      });

      console.log(`✅ Content ${content.id} classified:`, classification);
    } catch (error) {
      console.error('Error classifying content:', error);
    }
  }

  /**
   * Extract text content from various content types
   */
  private extractTextContent(content: Content): string {
    let text = `${content.title}\n${content.description || ''}`;

    switch (content.type) {
      case 'note':
        const noteData = content.data as NoteContent;
        text += '\n' + noteData.blocks.map(b => b.content).join('\n');
        break;
      
      case 'video':
        const videoData = content.data as VideoContent;
        text += '\n' + (videoData.summary || '') + '\n' + (videoData.transcript || '');
        break;
      
      case 'quiz':
        const quizData = content.data as QuizContent;
        text += '\n' + quizData.questions.map(q => 
          `${q.question}\n${q.options.join('\n')}\n${q.explanation || ''}`
        ).join('\n\n');
        break;
    }

    return text.trim();
  }

  /**
   * Batch classify multiple content items
   */
  async batchClassifyContent(contentIds: string[], language: string): Promise<void> {
    const contents = await Promise.all(
      contentIds.map(id => this.getContent(id, language))
    );

    const validContents = contents.filter((c): c is Content => c !== null && !c.aiProcessed);

    if (validContents.length === 0) {
      return;
    }

    const textContents = validContents.map(c => ({
      text: this.extractTextContent(c),
      language: c.language as any
    }));

    try {
      const results = await educationalContentModel.batchClassify(
        textContents,
        language as any
      );

      // Update all contents with results
      await Promise.all(
        validContents.map((content, index) =>
          this.updateContent(content.id, {
            classification: results[index],
            aiProcessed: true,
            tags: [...(content.tags || []), ...results[index].keywords],
          })
        )
      );

      console.log(`✅ Batch classified ${validContents.length} content items`);
    } catch (error) {
      console.error('Error batch classifying content:', error);
    }
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
