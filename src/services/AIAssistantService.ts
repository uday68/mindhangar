/**
 * AI Assistant Service - General Purpose LLM Integration
 * Uses Google Gemini API for intelligent assistance across the application
 * 
 * Features:
 * - Form input validation and suggestions
 * - Content generation and improvement
 * - Smart autocomplete
 * - Context-aware help
 * - Multi-language support
 */

import { testConnection } from '../../services/geminiService';
import { hfAI } from './HuggingFaceAIService';

interface AIRequest {
  prompt: string;
  context?: string;
  language?: string;
  maxTokens?: number;
  temperature?: number;
}

interface AIResponse {
  text: string;
  suggestions?: string[];
  confidence?: number;
  error?: string;
}

interface FormAssistRequest {
  fieldName: string;
  currentValue: string;
  fieldType: 'text' | 'email' | 'number' | 'textarea' | 'select';
  context?: string;
  language?: string;
}

class AIAssistantService {
  private apiKey: string | null = null;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  private isInitialized = false;
  private useHuggingFace = false; // Fallback to free models

  /**
   * Initialize the AI service with API key (optional)
   * If no API key provided, will use free Hugging Face models
   */
  async initialize(apiKey?: string): Promise<boolean> {
    if (apiKey) {
      this.apiKey = apiKey;
      
      // Test connection
      const isValid = await testConnection(apiKey);
      this.isInitialized = isValid;
      
      if (isValid) {
        this.useHuggingFace = false;
        return true;
      }
    }

    // Fallback to Hugging Face models
    console.log('🤖 Using free Hugging Face models (no API key required)');
    this.useHuggingFace = true;
    const hfReady = await hfAI.initialize((model, progress) => {
      console.log(`Loading ${model}: ${Math.round(progress * 100)}%`);
    });
    this.isInitialized = hfReady;
    
    return hfReady;
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Add Indian cultural context to prompts
   * Makes AI responses more relatable for Indian students
   */
  private addIndianContext(prompt: string, context?: string): string {
    const indianContext = `
You are an AI tutor for Indian students. Use Indian context in your responses:
- Use Indian names (Rahul, Priya, Arjun, Ananya, Rohan, Meera, etc.)
- Reference Indian cities (Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, etc.)
- Use Indian festivals (Diwali, Holi, Eid, Christmas, Pongal, Onam, etc.)
- Mention Indian sports (Cricket, Kabaddi, Badminton, Hockey, etc.)
- Use Indian currency (₹ Rupees, not dollars)
- Reference Indian education system (CBSE, ICSE, State Boards, JEE, NEET, UPSC, etc.)
- Use relatable Indian examples (local trains, auto-rickshaws, street food, etc.)
- Be culturally sensitive and inclusive of India's diversity

${context ? `Additional context: ${context}` : ''}

Now respond to: ${prompt}
`;
    return indianContext;
  }

  /**
   * Generate AI response for general queries
   */
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    if (!this.isReady()) {
      return {
        text: '',
        error: 'AI service not initialized. Initializing free models...'
      };
    }

    // Add Indian cultural context to the prompt
    const enhancedPrompt = this.addIndianContext(request.prompt, request.context);

    // Use Hugging Face if no API key or Gemini failed
    if (this.useHuggingFace) {
      const response = await hfAI.generateText({
        prompt: enhancedPrompt,
        maxLength: request.maxTokens || 100,
        temperature: request.temperature || 0.7
      });

      return {
        text: response.text,
        confidence: response.confidence,
        error: response.error
      };
    }

    // Use Gemini API
    try {
      const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: request.temperature || 0.7,
            maxOutputTokens: request.maxTokens || 1024,
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        text,
        confidence: 0.9
      };
    } catch (error) {
      console.error('AI generation error:', error);
      return {
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Assist with form input validation and suggestions
   */
  async assistFormInput(request: FormAssistRequest): Promise<AIResponse> {
    const prompt = this.buildFormAssistPrompt(request);
    
    return await this.generateResponse({
      prompt,
      language: request.language || 'en',
      temperature: 0.5, // Lower temperature for more consistent suggestions
      maxTokens: 256
    });
  }

  /**
   * Validate and improve user input
   */
  async validateInput(
    fieldName: string,
    value: string,
    rules?: string[]
  ): Promise<{ isValid: boolean; suggestions: string[]; improved?: string }> {
    if (!this.isReady()) {
      return { isValid: true, suggestions: [] };
    }

    // Use Hugging Face for validation
    if (this.useHuggingFace) {
      const result = await hfAI.validateInput(fieldName, value, rules);
      return { ...result, improved: value };
    }

    const rulesText = rules ? rules.join(', ') : 'general quality';
    const prompt = `Validate this input for "${fieldName}": "${value}"
    
Rules: ${rulesText}

Respond in JSON format:
{
  "isValid": true/false,
  "suggestions": ["suggestion1", "suggestion2"],
  "improved": "improved version if needed"
}`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.3,
      maxTokens: 256
    });

    try {
      const parsed = JSON.parse(response.text);
      return parsed;
    } catch {
      return { isValid: true, suggestions: [] };
    }
  }

  /**
   * Generate smart autocomplete suggestions
   */
  async getAutocompleteSuggestions(
    fieldName: string,
    partialInput: string,
    context?: string
  ): Promise<string[]> {
    if (!this.isReady() || partialInput.length < 2) {
      return [];
    }

    // Use Hugging Face for autocomplete
    if (this.useHuggingFace) {
      return await hfAI.getAutocompleteSuggestions(fieldName, partialInput, context);
    }

    const prompt = `Generate 3-5 autocomplete suggestions for "${fieldName}" field.
Current input: "${partialInput}"
${context ? `Context: ${context}` : ''}

Provide only the suggestions, one per line, completing the input naturally.`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.6,
      maxTokens: 128
    });

    if (response.error) return [];

    return response.text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .slice(0, 5);
  }

  /**
   * Improve text content (grammar, clarity, style)
   */
  async improveText(
    text: string,
    style: 'formal' | 'casual' | 'academic' | 'simple' = 'casual'
  ): Promise<string> {
    if (!this.isReady()) return text;

    // Use Hugging Face for text improvement
    if (this.useHuggingFace) {
      return await hfAI.improveText(text);
    }

    const prompt = `Improve this text to be ${style} and clear:

"${text}"

Provide only the improved version, no explanations.`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.7,
      maxTokens: 512
    });

    return response.error ? text : response.text.trim();
  }

  /**
   * Generate content based on topic
   */
  async generateContent(
    topic: string,
    type: 'summary' | 'explanation' | 'notes' | 'quiz',
    language: string = 'en'
  ): Promise<string> {
    if (!this.isReady()) {
      return 'AI service not available. Initializing...';
    }

    // Use Hugging Face for content generation
    if (this.useHuggingFace) {
      return await hfAI.generateStudyContent(topic, type);
    }

    const prompts = {
      summary: `Create a concise summary about: ${topic}`,
      explanation: `Explain this concept clearly for students: ${topic}`,
      notes: `Generate study notes about: ${topic}`,
      quiz: `Create 5 quiz questions about: ${topic}`
    };

    const response = await this.generateResponse({
      prompt: prompts[type],
      language,
      temperature: 0.8,
      maxTokens: 1024
    });

    return response.error ? `Error: ${response.error}` : response.text;
  }

  /**
   * Translate text to target language
   */
  async translateText(text: string, targetLanguage: string): Promise<string> {
    if (!this.isReady()) return text;

    const languageNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      ta: 'Tamil',
      te: 'Telugu',
      bn: 'Bengali',
      mr: 'Marathi',
      gu: 'Gujarati',
      kn: 'Kannada'
    };

    const prompt = `Translate this text to ${languageNames[targetLanguage] || targetLanguage}:

"${text}"

Provide only the translation, no explanations.`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.3,
      maxTokens: 512
    });

    return response.error ? text : response.text.trim();
  }

  /**
   * Get contextual help for a feature
   */
  async getContextualHelp(
    feature: string,
    userQuestion?: string
  ): Promise<string> {
    if (!this.isReady()) {
      return 'AI assistant is not available. Please configure your API key in Settings.';
    }

    const prompt = userQuestion
      ? `User is using "${feature}" feature and asks: "${userQuestion}". Provide helpful guidance.`
      : `Explain how to use the "${feature}" feature in MindHangar learning platform.`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.7,
      maxTokens: 512
    });

    return response.error ? `Error: ${response.error}` : response.text;
  }

  /**
   * Analyze study content and provide insights
   */
  async analyzeStudyContent(content: string): Promise<{
    difficulty: 'easy' | 'medium' | 'hard';
    topics: string[];
    estimatedTime: number;
    suggestions: string[];
  }> {
    if (!this.isReady()) {
      return {
        difficulty: 'medium',
        topics: [],
        estimatedTime: 30,
        suggestions: []
      };
    }

    // Use Hugging Face for content analysis
    if (this.useHuggingFace) {
      const analysis = await hfAI.analyzeContent(content);
      return {
        ...analysis,
        suggestions: ['Review regularly', 'Practice with examples', 'Take notes']
      };
    }

    const prompt = `Analyze this study content and respond in JSON:

"${content.substring(0, 500)}"

{
  "difficulty": "easy/medium/hard",
  "topics": ["topic1", "topic2"],
  "estimatedTime": minutes,
  "suggestions": ["suggestion1", "suggestion2"]
}`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.3,
      maxTokens: 256
    });

    try {
      return JSON.parse(response.text);
    } catch {
      return {
        difficulty: 'medium',
        topics: [],
        estimatedTime: 30,
        suggestions: []
      };
    }
  }

  /**
   * Build prompt with context
   */
  private buildPrompt(request: AIRequest): string {
    let prompt = request.prompt;

    if (request.context) {
      prompt = `Context: ${request.context}\n\n${prompt}`;
    }

    if (request.language && request.language !== 'en') {
      prompt += `\n\nRespond in ${request.language} language.`;
    }

    return prompt;
  }

  /**
   * Build form assistance prompt
   */
  private buildFormAssistPrompt(request: FormAssistRequest): string {
    const { fieldName, currentValue, fieldType, context } = request;

    let prompt = `Help user with form input:
Field: ${fieldName}
Type: ${fieldType}
Current value: "${currentValue}"
${context ? `Context: ${context}` : ''}

Provide:
1. Is the input valid?
2. Suggestions to improve it
3. Example of good input

Be concise and helpful.`;

    return prompt;
  }

  /**
   * Generate quiz questions from content
   */
  async generateQuiz(
    content: string,
    numQuestions: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>> {
    if (!this.isReady()) return [];

    const prompt = `Generate ${numQuestions} ${difficulty} multiple-choice questions from this content:

"${content.substring(0, 1000)}"

Format as JSON array:
[{
  "question": "Question text?",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "Why this is correct"
}]`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.7,
      maxTokens: 2048
    });

    try {
      return JSON.parse(response.text);
    } catch {
      return [];
    }
  }

  /**
   * Summarize long text
   */
  async summarize(
    text: string,
    maxLength: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<string> {
    if (!this.isReady()) return text;

    const lengths = {
      short: '2-3 sentences',
      medium: '1 paragraph',
      long: '2-3 paragraphs'
    };

    const prompt = `Summarize this in ${lengths[maxLength]}:

"${text}"

Provide only the summary.`;

    const response = await this.generateResponse({
      prompt,
      temperature: 0.5,
      maxTokens: 512
    });

    return response.error ? text : response.text.trim();
  }
}

// Export singleton instance
export const aiAssistant = new AIAssistantService();

// Export types
export type { AIRequest, AIResponse, FormAssistRequest };
