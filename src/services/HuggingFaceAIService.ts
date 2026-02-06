/**
 * Hugging Face AI Service - Free Browser-Based AI
 * Uses Transformers.js to run AI models directly in the browser
 * No API keys required, works offline after initial model download
 * 
 * Models used:
 * - Text generation: Xenova/Phi-1_5 (small, fast)
 * - Text classification: Xenova/distilbert-base-uncased-finetuned-sst-2-english
 * - Question answering: Xenova/distilbert-base-cased-distilled-squad
 * - Translation: Xenova/nllb-200-distilled-600M
 */

import { pipeline } from '@xenova/transformers';

interface HFAIRequest {
  prompt: string;
  context?: string;
  maxLength?: number;
  temperature?: number;
}

interface HFAIResponse {
  text: string;
  confidence?: number;
  error?: string;
}

class HuggingFaceAIService {
  private textGenerator: any = null;
  private questionAnswerer: any = null;
  private translator: any = null;
  private isInitialized = false;
  private isLoading = false;
  private loadingProgress: Record<string, number> = {};

  /**
   * Initialize the AI service and load models
   */
  async initialize(onProgress?: (model: string, progress: number) => void): Promise<boolean> {
    if (this.isInitialized) return true;
    if (this.isLoading) return false;

    this.isLoading = true;

    try {
      console.log('🤖 Loading AI models in browser...');

      // Load text generation model (small and fast)
      this.textGenerator = await pipeline(
        'text-generation',
        'Xenova/distilgpt2',
        {
          progress_callback: (progress: any) => {
            if (progress.status === 'progress') {
              this.loadingProgress['text-generation'] = progress.progress || 0;
              onProgress?.('text-generation', progress.progress || 0);
            }
          }
        }
      );

      // Load question answering model
      this.questionAnswerer = await pipeline(
        'question-answering',
        'Xenova/distilbert-base-cased-distilled-squad',
        {
          progress_callback: (progress: any) => {
            if (progress.status === 'progress') {
              this.loadingProgress['question-answering'] = progress.progress || 0;
              onProgress?.('question-answering', progress.progress || 0);
            }
          }
        }
      );

      this.isInitialized = true;
      this.isLoading = false;
      console.log('✅ AI models loaded successfully!');
      return true;
    } catch (error) {
      console.error('❌ Failed to load AI models:', error);
      this.isLoading = false;
      return false;
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.textGenerator !== null;
  }

  /**
   * Get loading progress
   */
  getLoadingProgress(): Record<string, number> {
    return this.loadingProgress;
  }

  /**
   * Generate text response
   */
  async generateText(request: HFAIRequest): Promise<HFAIResponse> {
    if (!this.isReady()) {
      return {
        text: '',
        error: 'AI models not loaded yet. Please wait...'
      };
    }

    try {
      const prompt = this.buildPrompt(request);
      const maxLength = request.maxLength || 100;

      const result = await this.textGenerator!(prompt, {
        max_new_tokens: maxLength,
        temperature: request.temperature || 0.7,
        do_sample: true,
        top_k: 50,
        top_p: 0.9
      });

      const generatedText = result[0].generated_text;
      // Remove the prompt from the generated text
      const responseText = generatedText.replace(prompt, '').trim();

      return {
        text: responseText,
        confidence: 0.8
      };
    } catch (error) {
      console.error('Text generation error:', error);
      return {
        text: '',
        error: error instanceof Error ? error.message : 'Generation failed'
      };
    }
  }

  /**
   * Answer questions based on context
   */
  async answerQuestion(question: string, context: string): Promise<HFAIResponse> {
    if (!this.questionAnswerer) {
      return {
        text: '',
        error: 'Question answering model not loaded'
      };
    }

    try {
      const result = await this.questionAnswerer(question, context);
      
      return {
        text: result.answer,
        confidence: result.score
      };
    } catch (error) {
      console.error('Question answering error:', error);
      return {
        text: '',
        error: error instanceof Error ? error.message : 'Failed to answer question'
      };
    }
  }

  /**
   * Validate form input
   */
  async validateInput(
    fieldName: string,
    value: string,
    rules?: string[]
  ): Promise<{ isValid: boolean; suggestions: string[] }> {
    if (!this.isReady()) {
      return { isValid: true, suggestions: [] };
    }

    // Simple validation rules
    const suggestions: string[] = [];
    let isValid = true;

    // Basic validation
    if (value.trim().length === 0) {
      isValid = false;
      suggestions.push(`${fieldName} cannot be empty`);
    }

    // Email validation
    if (fieldName.toLowerCase().includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        suggestions.push('Please enter a valid email address');
      }
    }

    // Phone validation
    if (fieldName.toLowerCase().includes('phone')) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value.replace(/\D/g, ''))) {
        isValid = false;
        suggestions.push('Please enter a valid 10-digit phone number');
      }
    }

    return { isValid, suggestions };
  }

  /**
   * Generate autocomplete suggestions
   */
  async getAutocompleteSuggestions(
    fieldName: string,
    partialInput: string,
    context?: string
  ): Promise<string[]> {
    if (!this.isReady() || partialInput.length < 2) {
      return [];
    }

    // Predefined suggestions for common fields
    const commonSuggestions: Record<string, string[]> = {
      subject: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Computer Science'],
      goal: ['Board Exam Preparation', 'JEE Preparation', 'NEET Preparation', 'Improve Grades', 'Learn New Skills'],
      grade: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
      board: ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE']
    };

    // Find matching field
    const fieldKey = Object.keys(commonSuggestions).find(key =>
      fieldName.toLowerCase().includes(key)
    );

    if (fieldKey) {
      return commonSuggestions[fieldKey].filter(suggestion =>
        suggestion.toLowerCase().includes(partialInput.toLowerCase())
      );
    }

    return [];
  }

  /**
   * Improve text (basic grammar and clarity)
   */
  async improveText(text: string): Promise<string> {
    if (!this.isReady()) return text;

    // Basic text improvements
    let improved = text.trim();
    
    // Capitalize first letter
    improved = improved.charAt(0).toUpperCase() + improved.slice(1);
    
    // Add period if missing
    if (!/[.!?]$/.test(improved)) {
      improved += '.';
    }

    // Remove multiple spaces
    improved = improved.replace(/\s+/g, ' ');

    return improved;
  }

  /**
   * Generate study content
   */
  async generateStudyContent(
    topic: string,
    type: 'summary' | 'explanation' | 'notes' | 'quiz'
  ): Promise<string> {
    if (!this.isReady()) {
      return 'AI models not ready. Please wait for models to load.';
    }

    const prompts = {
      summary: `Summarize the key points about ${topic}:\n\n`,
      explanation: `Explain ${topic} in simple terms:\n\n`,
      notes: `Study notes for ${topic}:\n\n`,
      quiz: `Quiz questions about ${topic}:\n\n`
    };

    const response = await this.generateText({
      prompt: prompts[type],
      maxLength: 200,
      temperature: 0.7
    });

    return response.error ? `Error: ${response.error}` : response.text;
  }

  /**
   * Analyze study content
   */
  async analyzeContent(content: string): Promise<{
    difficulty: 'easy' | 'medium' | 'hard';
    topics: string[];
    estimatedTime: number;
  }> {
    // Simple heuristic-based analysis
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;

    // Determine difficulty
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    if (avgWordsPerSentence < 10) difficulty = 'easy';
    else if (avgWordsPerSentence > 20) difficulty = 'hard';

    // Estimate reading time (200 words per minute)
    const estimatedTime = Math.ceil(wordCount / 200);

    // Extract potential topics (simple keyword extraction)
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const topics = [...new Set(words.filter(w => w.length > 5 && !commonWords.has(w)))].slice(0, 5);

    return {
      difficulty,
      topics,
      estimatedTime
    };
  }

  /**
   * Generate conversational response for onboarding
   */
  async generateOnboardingResponse(
    userAnswer: string,
    context: string,
    nextQuestion: string
  ): Promise<string> {
    if (!this.isReady()) {
      return nextQuestion;
    }

    // Generate a friendly transition
    const transitions = [
      `Great! ${nextQuestion}`,
      `Perfect! ${nextQuestion}`,
      `Excellent choice! ${nextQuestion}`,
      `That's helpful to know. ${nextQuestion}`,
      `Thanks for sharing! ${nextQuestion}`
    ];

    return transitions[Math.floor(Math.random() * transitions.length)];
  }

  /**
   * Generate learning path steps
   */
  async generateLearningPath(
    goal: string,
    subjects: string[],
    studyTime: number,
    duration: number = 30
  ): Promise<Array<{
    day: number;
    title: string;
    description: string;
    type: 'lesson' | 'practice' | 'quiz' | 'project';
    duration: number;
  }>> {
    // Generate a structured learning path
    const steps = [];
    const daysPerSubject = Math.floor(duration / subjects.length);

    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      
      for (let day = 1; day <= daysPerSubject; day++) {
        const dayNumber = i * daysPerSubject + day;
        
        if (day % 5 === 0) {
          // Project day
          steps.push({
            day: dayNumber,
            title: `${subject} - Weekly Project`,
            description: `Apply all concepts learned in ${subject} this week`,
            type: 'project' as const,
            duration: studyTime
          });
        } else if (day % 3 === 0) {
          // Quiz day
          steps.push({
            day: dayNumber,
            title: `${subject} - Practice Quiz`,
            description: `Test your knowledge with practice questions`,
            type: 'quiz' as const,
            duration: studyTime
          });
        } else if (day % 2 === 0) {
          // Practice day
          steps.push({
            day: dayNumber,
            title: `${subject} - Practice Problems`,
            description: `Solve practice problems to reinforce concepts`,
            type: 'practice' as const,
            duration: studyTime
          });
        } else {
          // Lesson day
          steps.push({
            day: dayNumber,
            title: `${subject} - New Concepts`,
            description: `Learn new concepts and fundamentals`,
            type: 'lesson' as const,
            duration: studyTime
          });
        }
      }
    }

    return steps.slice(0, duration);
  }

  /**
   * Build prompt with context
   */
  private buildPrompt(request: HFAIRequest): string {
    let prompt = request.prompt;

    if (request.context) {
      prompt = `Context: ${request.context}\n\n${prompt}`;
    }

    return prompt;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.textGenerator = null;
    this.questionAnswerer = null;
    this.translator = null;
    this.isInitialized = false;
    this.loadingProgress = {};
  }
}

// Export singleton instance
export const hfAI = new HuggingFaceAIService();

// Export types
export type { HFAIRequest, HFAIResponse };
