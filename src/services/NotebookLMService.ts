/**
 * NotebookLM-Style Service
 * AI-powered note-taking, summarization, and study guide generation
 */

import { aiAssistant } from './AIAssistantService';

export interface Note {
  id: string;
  title: string;
  content: string;
  courseId?: string;
  moduleId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  summary?: string;
}

export interface StudyGuide {
  id: string;
  title: string;
  sections: StudySection[];
  keyPoints: string[];
  practiceQuestions: string[];
  resources: string[];
}

export interface StudySection {
  title: string;
  content: string;
  examples: string[];
}

class NotebookLMService {
  /**
   * Summarize content (video transcript, notes, articles)
   */
  async summarize(content: string, type: 'brief' | 'detailed' = 'brief'): Promise<string> {
    try {
      const maxLength = type === 'brief' ? 200 : 500;
      const prompt = `Summarize this content in ${maxLength} words or less. Focus on key points and main ideas:

${content}`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.5,
        maxTokens: type === 'brief' ? 256 : 512
      });

      return response.text;
    } catch (error) {
      console.error('Summarization error:', error);
      return 'Unable to generate summary.';
    }
  }

  /**
   * Extract key points from content
   */
  async extractKeyPoints(content: string, count: number = 5): Promise<string[]> {
    try {
      const prompt = `Extract the ${count} most important key points from this content:

${content}

Return as JSON array of strings.`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.3,
        maxTokens: 512
      });

      const points = JSON.parse(response.text);
      return Array.isArray(points) ? points : [];
    } catch (error) {
      console.error('Key points extraction error:', error);
      return [];
    }
  }

  /**
   * Generate study guide from notes
   */
  async generateStudyGuide(notes: Note[], topic: string): Promise<StudyGuide> {
    try {
      const combinedContent = notes.map(n => n.content).join('\n\n');
      
      const prompt = `Create a comprehensive study guide for "${topic}" based on these notes:

${combinedContent}

Include:
1. Main sections with explanations
2. Key points to remember
3. Practice questions
4. Additional resources

Format as JSON with: sections[], keyPoints[], practiceQuestions[], resources[]`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.7,
        maxTokens: 2048
      });

      const guide = JSON.parse(response.text);
      
      return {
        id: `guide-${Date.now()}`,
        title: `${topic} Study Guide`,
        ...guide
      };
    } catch (error) {
      console.error('Study guide generation error:', error);
      return {
        id: `guide-${Date.now()}`,
        title: `${topic} Study Guide`,
        sections: [],
        keyPoints: [],
        practiceQuestions: [],
        resources: []
      };
    }
  }

  /**
   * Smart search across notes
   */
  async searchNotes(query: string, notes: Note[]): Promise<Note[]> {
    try {
      const prompt = `Find notes most relevant to this query: "${query}"

Notes:
${notes.map((n, i) => `${i}. ${n.title}: ${n.content.substring(0, 200)}...`).join('\n')}

Return array of note indices (0-based) in order of relevance.`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.3,
        maxTokens: 256
      });

      const indices = JSON.parse(response.text);
      return indices.map((i: number) => notes[i]).filter(Boolean);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback: simple text search
      return notes.filter(n => 
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        n.content.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  /**
   * Generate flashcards from notes
   */
  async generateFlashcards(content: string, count: number = 10): Promise<Array<{front: string, back: string}>> {
    try {
      const prompt = `Generate ${count} flashcards from this content:

${content}

Format as JSON array with: front (question/term), back (answer/definition)`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.7,
        maxTokens: 1024
      });

      const flashcards = JSON.parse(response.text);
      return Array.isArray(flashcards) ? flashcards : [];
    } catch (error) {
      console.error('Flashcard generation error:', error);
      return [];
    }
  }

  /**
   * Answer questions based on notes
   */
  async answerQuestion(question: string, notes: Note[]): Promise<string> {
    try {
      const context = notes.map(n => n.content).join('\n\n');
      
      const prompt = `Answer this question based on the provided notes:

Question: ${question}

Notes:
${context}

Provide a clear, concise answer.`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.5,
        maxTokens: 512
      });

      return response.text;
    } catch (error) {
      console.error('Question answering error:', error);
      return 'Unable to answer question based on available notes.';
    }
  }

  /**
   * Suggest related topics
   */
  async suggestRelatedTopics(content: string): Promise<string[]> {
    try {
      const prompt = `Based on this content, suggest 5 related topics to explore:

${content}

Return as JSON array of topic strings.`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.7,
        maxTokens: 256
      });

      const topics = JSON.parse(response.text);
      return Array.isArray(topics) ? topics : [];
    } catch (error) {
      console.error('Topic suggestion error:', error);
      return [];
    }
  }

  /**
   * Auto-organize notes with tags
   */
  async autoTag(note: Note): Promise<string[]> {
    try {
      const prompt = `Suggest 3-5 relevant tags for this note:

Title: ${note.title}
Content: ${note.content.substring(0, 500)}

Return as JSON array of tag strings.`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.5,
        maxTokens: 128
      });

      const tags = JSON.parse(response.text);
      return Array.isArray(tags) ? tags : [];
    } catch (error) {
      console.error('Auto-tagging error:', error);
      return [];
    }
  }

  /**
   * Generate practice quiz from notes
   */
  async generatePracticeQuiz(notes: Note[], difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<any[]> {
    try {
      const content = notes.map(n => n.content).join('\n\n');
      
      const prompt = `Generate 5 ${difficulty} practice questions from these notes:

${content}

Format as JSON array with: question, options (4 choices), correctAnswer (index), explanation`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.7,
        maxTokens: 1536
      });

      const questions = JSON.parse(response.text);
      return Array.isArray(questions) ? questions : [];
    } catch (error) {
      console.error('Practice quiz generation error:', error);
      return [];
    }
  }
}

export const notebookLM = new NotebookLMService();
