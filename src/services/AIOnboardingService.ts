/**
 * AI-Guided Onboarding Service
 * Conversational flow to capture student goals and create personalized learning paths
 */

import { aiAssistant } from './AIAssistantService';
import { hfAI } from './HuggingFaceAIService';
import { notionDB, StudentProfile, LearningGoal, LearningPath } from '../db/notionLikeDB';

interface OnboardingStep {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'multiChoice' | 'date';
  options?: string[];
  validation?: (answer: string) => boolean;
  aiPrompt: string; // Prompt to generate personalized follow-up
}

interface OnboardingState {
  currentStep: number;
  answers: Record<string, any>;
  studentId: string;
  completed: boolean;
}

class AIOnboardingService {
  private onboardingSteps: OnboardingStep[] = [
    {
      id: 'greeting',
      question: 'Hi! I\'m your AI study companion. What should I call you?',
      type: 'text',
      aiPrompt: 'Greet the student warmly by name and ask about their current grade/class.',
      validation: (answer) => answer.length > 0
    },
    {
      id: 'grade',
      question: 'Which grade/class are you currently in?',
      type: 'choice',
      options: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'College'],
      aiPrompt: 'Based on their grade, ask about their educational board (CBSE/ICSE/State).'
    },
    {
      id: 'board',
      question: 'Which educational board are you following?',
      type: 'choice',
      options: ['CBSE', 'ICSE', 'State Board', 'International Board', 'Other'],
      aiPrompt: 'Ask about their main academic goal or upcoming exam.'
    },
    {
      id: 'mainGoal',
      question: 'What\'s your main academic goal right now?',
      type: 'choice',
      options: [
        'Prepare for board exams',
        'Prepare for JEE/NEET',
        'Improve grades in specific subjects',
        'Learn new skills',
        'Prepare for competitive exams',
        'Other'
      ],
      aiPrompt: 'Based on their goal, ask which subjects they want to focus on.'
    },
    {
      id: 'subjects',
      question: 'Which subjects do you want to focus on?',
      type: 'multiChoice',
      options: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Science', 'Computer Science'],
      aiPrompt: 'Ask about their current level in these subjects and areas of difficulty.'
    },
    {
      id: 'studyTime',
      question: 'How much time can you dedicate to studying each day?',
      type: 'choice',
      options: ['30 minutes', '1 hour', '2 hours', '3 hours', '4+ hours'],
      aiPrompt: 'Ask if they have any upcoming exams or deadlines.'
    },
    {
      id: 'deadline',
      question: 'Do you have any upcoming exams or important deadlines?',
      type: 'text',
      aiPrompt: 'Ask about their preferred learning style and any challenges they face.'
    },
    {
      id: 'challenges',
      question: 'What challenges do you face in your studies?',
      type: 'multiChoice',
      options: [
        'Difficulty understanding concepts',
        'Time management',
        'Staying motivated',
        'Too much syllabus',
        'Exam anxiety',
        'Language barriers'
      ],
      aiPrompt: 'Summarize their profile and confirm if everything is correct.'
    }
  ];

  private state: OnboardingState | null = null;

  /**
   * Start onboarding for a new student
   */
  async startOnboarding(studentId: string): Promise<{ question: string; options?: string[] }> {
    this.state = {
      currentStep: 0,
      answers: {},
      studentId,
      completed: false
    };

    const step = this.onboardingSteps[0];
    return {
      question: step.question,
      options: step.options
    };
  }

  /**
   * Process answer and get next question
   */
  async processAnswer(answer: string | string[]): Promise<{
    question: string;
    options?: string[];
    completed: boolean;
    aiResponse?: string;
  }> {
    if (!this.state) {
      throw new Error('Onboarding not started');
    }

    const currentStep = this.onboardingSteps[this.state.currentStep];
    
    // Safety check for undefined step
    if (!currentStep) {
      return {
        question: 'Onboarding completed!',
        completed: true
      };
    }
    
    // Validate answer - convert to string for validation
    const answerStr = Array.isArray(answer) ? answer.join(', ') : String(answer);
    if (currentStep.validation && !currentStep.validation(answerStr)) {
      return {
        question: 'Please provide a valid answer. ' + currentStep.question,
        options: currentStep.options,
        completed: false
      };
    }

    // Save answer
    this.state.answers[currentStep.id] = answer;

    // Generate AI response for current answer
    let aiResponse = '';
    
    // Use Hugging Face for conversational responses
    if (hfAI.isReady()) {
      const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
      aiResponse = await hfAI.generateOnboardingResponse(
        answerText,
        JSON.stringify(this.state.answers),
        this.onboardingSteps[this.state.currentStep + 1]?.question || ''
      );
    } else if (aiAssistant.isReady()) {
      const response = await aiAssistant.generateResponse({
        prompt: `Student answered: "${answer}". ${currentStep.aiPrompt}`,
        context: `Onboarding conversation. Previous answers: ${JSON.stringify(this.state.answers)}`,
        temperature: 0.8,
        maxTokens: 150
      });
      aiResponse = response.text;
    }

    // Move to next step
    this.state.currentStep++;

    // Check if completed
    if (this.state.currentStep >= this.onboardingSteps.length) {
      this.state.completed = true;
      await this.createStudentProfile();
      await this.generateLearningPath();
      
      return {
        question: 'Perfect! I\'ve created a personalized learning path for you. Let\'s start your journey! 🚀',
        completed: true,
        aiResponse
      };
    }

    // Get next question
    const nextStep = this.onboardingSteps[this.state.currentStep];
    return {
      question: aiResponse || nextStep.question,
      options: nextStep.options,
      completed: false,
      aiResponse
    };
  }

  /**
   * Create student profile from onboarding answers
   */
  private async createStudentProfile(): Promise<void> {
    if (!this.state) return;

    const answers = this.state.answers;
    
    // Safely handle subjects (could be string or array)
    const subjectsArray = Array.isArray(answers.subjects) 
      ? answers.subjects 
      : (answers.subjects ? [answers.subjects] : []);
    
    const profile: StudentProfile = {
      id: this.state.studentId,
      name: answers.greeting || 'Student',
      email: '', // Will be filled from auth
      grade: answers.grade || 'Class 10',
      board: answers.board || 'CBSE',
      goals: [],
      currentPath: null,
      preferences: {
        language: 'en',
        subjects: subjectsArray,
        studyTime: this.parseStudyTime(answers.studyTime || '1 hour'),
        examDate: answers.deadline ? new Date(answers.deadline) : undefined
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await notionDB.saveStudent(profile);

    // Create learning goal
    const goal: LearningGoal = {
      id: `goal_${Date.now()}`,
      title: answers.mainGoal || 'Academic Excellence',
      description: `Focus on ${subjectsArray.join(', ') || 'studies'}`,
      type: this.determineGoalType(answers.mainGoal || ''),
      priority: 'high',
      deadline: answers.deadline ? new Date(answers.deadline) : undefined,
      status: 'active',
      progress: 0,
      milestones: [],
      createdAt: new Date()
    };

    await notionDB.saveGoal(goal, this.state.studentId);
  }

  /**
   * Generate personalized learning path using AI
   */
  private async generateLearningPath(): Promise<void> {
    if (!this.state) return;

    const answers = this.state.answers;
    
    // Safely handle subjects array
    const subjectsArray = Array.isArray(answers.subjects) 
      ? answers.subjects 
      : (answers.subjects ? [answers.subjects] : ['General Studies']);
    
    // Use Hugging Face to generate learning path
    if (hfAI.isReady()) {
      const studyTime = this.parseStudyTime(answers.studyTime || '1 hour');
      
      const steps = await hfAI.generateLearningPath(
        answers.mainGoal || 'Academic Excellence',
        subjectsArray,
        studyTime,
        30
      );

      const path: LearningPath = {
        id: `path_${Date.now()}`,
        goalId: `goal_${Date.now()}`,
        title: `${answers.mainGoal || 'Learning'} - 30 Day Plan`,
        description: `Personalized learning path for ${subjectsArray.join(', ')}`,
        totalSteps: steps.length,
        currentStep: 0,
        steps: steps.map((step, index) => ({
          id: `step_${index}`,
          order: index,
          title: step.title,
          description: step.description,
          type: step.type,
          content: '',
          resources: [],
          completed: false,
          timeSpent: 0
        })),
        estimatedDuration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await notionDB.savePath(path);
      return;
    }

    // Fallback: Use Gemini API if available
    if (!aiAssistant.isReady()) return;
    
    // Safely handle challenges array
    const challengesArray = Array.isArray(answers.challenges) 
      ? answers.challenges 
      : (answers.challenges ? [answers.challenges] : []);
    
    // Generate path using AI
    const prompt = `Create a detailed learning path for a student with:
- Grade: ${answers.grade || 'Class 10'}
- Board: ${answers.board || 'CBSE'}
- Goal: ${answers.mainGoal || 'Academic Excellence'}
- Subjects: ${subjectsArray.join(', ')}
- Study time: ${answers.studyTime || '1 hour'} per day
- Challenges: ${challengesArray.join(', ') || 'None'}

Generate a structured 30-day learning path with daily steps. Format as JSON:
{
  "title": "Path title",
  "description": "Path description",
  "steps": [
    {
      "day": 1,
      "title": "Step title",
      "description": "What to do",
      "type": "lesson/practice/quiz",
      "duration": 60
    }
  ]
}`;

    const response = await aiAssistant.generateResponse({
      prompt,
      temperature: 0.7,
      maxTokens: 2048
    });

    try {
      const pathData = JSON.parse(response.text);
      
      const path: LearningPath = {
        id: `path_${Date.now()}`,
        goalId: `goal_${Date.now()}`,
        title: pathData.title,
        description: pathData.description,
        totalSteps: pathData.steps.length,
        currentStep: 0,
        steps: pathData.steps.map((step: any, index: number) => ({
          id: `step_${index}`,
          order: index,
          title: step.title,
          description: step.description,
          type: step.type,
          content: '',
          resources: [],
          completed: false,
          timeSpent: 0
        })),
        estimatedDuration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await notionDB.savePath(path);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }
  }

  /**
   * Helper methods
   */
  private parseStudyTime(timeStr: string | string[] | undefined): number {
    // Handle undefined
    if (!timeStr) {
      return 60; // Default 1 hour
    }
    
    // Handle array input
    if (Array.isArray(timeStr)) {
      timeStr = timeStr[0] || '1 hour';
    }
    
    // Ensure it's a string
    if (typeof timeStr !== 'string') {
      return 60; // Default 1 hour
    }
    
    // Extract number from string
    const match = timeStr.match(/(\d+)/);
    return match ? parseInt(match[1]) * 60 : 60; // Convert to minutes
  }

  private determineGoalType(goal: string): 'exam' | 'skill' | 'subject' | 'career' {
    if (goal.includes('exam')) return 'exam';
    if (goal.includes('skill')) return 'skill';
    if (goal.includes('subject')) return 'subject';
    return 'career';
  }

  /**
   * Get current onboarding state
   */
  getState(): OnboardingState | null {
    return this.state;
  }

  /**
   * Reset onboarding
   */
  reset(): void {
    this.state = null;
  }
}

export const aiOnboarding = new AIOnboardingService();
export type { OnboardingStep, OnboardingState };
