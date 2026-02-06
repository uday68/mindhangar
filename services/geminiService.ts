/**
 * Gemini Service Wrapper
 * 
 * This file provides backward compatibility for panel components that import geminiService.
 * It delegates all calls to the new AIAssistantService which supports both Gemini API
 * and free Hugging Face models.
 */

import { aiAssistant } from '../src/services/AIAssistantService';
import { hfAI } from '../src/services/HuggingFaceAIService';
import { errorService, ErrorCode } from '../src/services/ErrorService';
import { QuizQuestion, Flashcard, SearchResult, LearningRoadmap } from '../types';

/**
 * Test API connection
 */
export async function testConnection(apiKey?: string): Promise<boolean> {
  try {
    if (apiKey) {
      await aiAssistant.initialize(apiKey);
    }
    return aiAssistant.isReady() || hfAI.isReady();
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

/**
 * Create a chat session
 */
export async function createChatSession(systemPrompt?: string) {
  return {
    sendMessage: async (message: string): Promise<string> => {
      try {
        const response = await aiAssistant.generateResponse({
          prompt: message,
          context: systemPrompt,
          temperature: 0.7,
          maxTokens: 1024
        });
        return response.text;
      } catch (error) {
        const appError = errorService.handleAIError(error, 'gemini');
        console.error('Chat error:', appError);
        return appError.userMessage;
      }
    }
  };
}

/**
 * Summarize content (for VideoPanel)
 */
export async function summarizeContent(content: string, type: 'video' | 'article' | 'notes'): Promise<string> {
  try {
    const prompt = `Summarize this ${type} content in a clear, concise way. Focus on key points and main ideas:\n\n${content}`;
    
    const response = await aiAssistant.generateResponse({
      prompt,
      temperature: 0.5,
      maxTokens: 512
    });
    
    return response.text;
  } catch (error) {
    const appError = errorService.handleAIError(error, 'gemini');
    console.error('Summarization error:', appError);
    return appError.userMessage;
  }
}

/**
 * Perform semantic search
 */
export async function performSemanticSearch(query: string, context: string): Promise<SearchResult[]> {
  try {
    const prompt = `Search for: "${query}" in the following context. Return relevant results as JSON array with title, snippet, and relevance score:\n\n${context}`;
    
    const response = await aiAssistant.generateResponse({
      prompt,
      temperature: 0.3,
      maxTokens: 1024
    });
    
    // Try to parse JSON response
    try {
      const results = JSON.parse(response.text);
      return Array.isArray(results) ? results : [];
    } catch {
      // Fallback: create a single result from the response
      return [{
        id: '1',
        title: 'Search Result',
        snippet: response.text,
        qualityScore: 0.8,
        source: 'AI Search',
        date: new Date().toISOString(),
        url: ''
      }];
    }
  } catch (error) {
    const appError = errorService.handleAIError(error, 'gemini');
    console.error('Search error:', appError);
    return [];
  }
}

/**
 * Generate quiz questions
 */
export async function generateQuizQuestions(topic: string, count: number = 5, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<QuizQuestion[]> {
  try {
    const prompt = `Generate ${count} ${difficulty} multiple-choice quiz questions about "${topic}". 
Format as JSON array with: question, options (array of 4 choices), correctAnswer (index 0-3), explanation.
Use Indian educational context and examples.`;
    
    const response = await aiAssistant.generateResponse({
      prompt,
      temperature: 0.7,
      maxTokens: 2048
    });
    
    try {
      const questions = JSON.parse(response.text);
      return Array.isArray(questions) ? questions.map((q: any) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctAnswer || q.correctIndex || 0
      })) : [];
    } catch {
      // Fallback: return empty array
      return [];
    }
  } catch (error) {
    const appError = errorService.handleAIError(error, 'gemini');
    console.error('Quiz generation error:', appError);
    return [];
  }
}

/**
 * Generate flashcards
 */
export async function generateFlashcards(topic: string, count: number = 10): Promise<Flashcard[]> {
  try {
    const prompt = `Generate ${count} flashcards for studying "${topic}". 
Format as JSON array with: front (question/term), back (answer/definition).
Use Indian educational context.`;
    
    const response = await aiAssistant.generateResponse({
      prompt,
      temperature: 0.7,
      maxTokens: 2048
    });
    
    try {
      const cards = JSON.parse(response.text);
      return Array.isArray(cards) ? cards.map((c: any) => ({
        front: c.front,
        back: c.back
      })) : [];
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Flashcard generation error:', error);
    return [];
  }
}

/**
 * Generate performance review
 */
export interface ReviewData {
  subject: string;
  recentScores: number[];
  timeSpent: number;
  topicsStudied: string[];
}

export async function generatePerformanceReview(data: ReviewData): Promise<string> {
  try {
    const avgScore = data.recentScores.reduce((a, b) => a + b, 0) / data.recentScores.length;
    
    const prompt = `Analyze this student's performance and provide constructive feedback:
- Subject: ${data.subject}
- Average Score: ${avgScore.toFixed(1)}%
- Time Spent: ${data.timeSpent} minutes
- Topics Studied: ${data.topicsStudied.join(', ')}

Provide: strengths, areas for improvement, and specific recommendations. Use encouraging tone suitable for Indian students.`;
    
    const response = await aiAssistant.generateResponse({
      prompt,
      temperature: 0.7,
      maxTokens: 1024
    });
    
    return response.text;
  } catch (error) {
    console.error('Review generation error:', error);
    return 'Unable to generate performance review. Please try again.';
  }
}

/**
 * Generate plan suggestion
 */
export async function generatePlanSuggestion(goal: string, timeAvailable: number, currentLevel: string): Promise<string> {
  try {
    const prompt = `Create a study plan for:
- Goal: ${goal}
- Time Available: ${timeAvailable} hours per week
- Current Level: ${currentLevel}

Provide a structured weekly plan with specific daily tasks. Consider Indian academic calendar and exam patterns.`;
    
    const response = await aiAssistant.generateResponse({
      prompt,
      temperature: 0.7,
      maxTokens: 1024
    });
    
    return response.text;
  } catch (error) {
    console.error('Plan generation error:', error);
    return 'Unable to generate study plan. Please try again.';
  }
}

/**
 * Generate learning roadmap
 */
export async function generateLearningRoadmap(goal: string, duration: number, subjects: string[]): Promise<LearningRoadmap> {
  try {
    const prompt = `Create a ${duration}-week learning roadmap for:
- Goal: ${goal}
- Subjects: ${subjects.join(', ')}

Format as JSON with: title, description, weeks (array of week objects with weekNumber, focus, topics array, milestones array).
Align with Indian education system (CBSE/ICSE/State boards).`;
    
    const response = await aiAssistant.generateResponse({
      prompt,
      temperature: 0.7,
      maxTokens: 2048
    });
    
    try {
      const roadmap = JSON.parse(response.text);
      return {
        title: roadmap.title || goal,
        description: roadmap.description || '',
        modules: roadmap.modules || roadmap.weeks || []
      };
    } catch {
      // Fallback roadmap
      return {
        title: goal,
        description: 'Custom learning roadmap',
        modules: []
      };
    }
  } catch (error) {
    console.error('Roadmap generation error:', error);
    return {
      title: goal,
      description: 'Unable to generate roadmap',
      modules: []
    };
  }
}

/**
 * Analyze focus frame (for FocusPanel)
 */
export async function analyzeFocusFrame(imageData: string): Promise<{
  isDistracted: boolean;
  confidence: number;
  suggestion: string;
}> {
  try {
    // Note: Image analysis requires vision models
    // For now, return a placeholder response
    // TODO: Implement with vision-capable model
    
    return {
      isDistracted: false,
      confidence: 0.5,
      suggestion: 'Focus analysis requires camera permissions. Stay focused on your studies!'
    };
  } catch (error) {
    console.error('Focus analysis error:', error);
    return {
      isDistracted: false,
      confidence: 0,
      suggestion: 'Unable to analyze focus. Keep studying!'
    };
  }
}

// Export all functions
export default {
  testConnection,
  createChatSession,
  summarizeContent,
  performSemanticSearch,
  generateQuizQuestions,
  generateFlashcards,
  generatePerformanceReview,
  generatePlanSuggestion,
  generateLearningRoadmap,
  analyzeFocusFrame
};
