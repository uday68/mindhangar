/**
 * Course Creation Agent
 * Conversational AI agent that guides users through course creation
 * by asking intelligent questions and gathering necessary details
 */

export interface ConversationMessage {
  id: string;
  role: 'agent' | 'user';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface CourseRequirements {
  topic: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number; // in hours
  moduleCount?: number;
  learningObjectives?: string[];
  targetAudience?: string;
  prerequisites?: string[];
  preferredLanguage?: string;
  culturalContext?: string;
  includeQuizzes?: boolean;
  includeProjects?: boolean;
  specificTopics?: string[];
}

export interface ConversationState {
  step: number;
  requirements: Partial<CourseRequirements>;
  conversationHistory: ConversationMessage[];
  isComplete: boolean;
}

export class CourseCreationAgent {
  private agentId = 'course-creation-agent';
  private name = 'Course Creation Assistant';
  private conversationSteps = [
    'greeting',
    'topic',
    'level',
    'objectives',
    'duration',
    'audience',
    'prerequisites',
    'language',
    'content_preferences',
    'confirmation'
  ];

  /**
   * Start a new course creation conversation
   */
  startConversation(): ConversationState {
    const greeting = this.generateGreeting();
    
    return {
      step: 0,
      requirements: {},
      conversationHistory: [
        {
          id: `msg-${Date.now()}`,
          role: 'agent',
          content: greeting,
          timestamp: new Date()
        }
      ],
      isComplete: false
    };
  }

  /**
   * Process user response and generate next question
   */
  async processResponse(
    state: ConversationState,
    userResponse: string
  ): Promise<ConversationState> {
    // Add user message to history
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userResponse,
      timestamp: new Date()
    };

    const newHistory = [...state.conversationHistory, userMessage];

    // Extract information from user response
    const updatedRequirements = await this.extractInformation(
      state.requirements,
      userResponse,
      this.conversationSteps[state.step]
    );

    // Generate next question
    const nextStep = state.step + 1;
    const agentResponse = await this.generateNextQuestion(
      nextStep,
      updatedRequirements
    );

    // Add agent message to history
    const agentMessage: ConversationMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'agent',
      content: agentResponse,
      timestamp: new Date()
    };

    const isComplete = nextStep >= this.conversationSteps.length;

    return {
      step: nextStep,
      requirements: updatedRequirements,
      conversationHistory: [...newHistory, agentMessage],
      isComplete
    };
  }

  /**
   * Generate greeting message
   */
  private generateGreeting(): string {
    return `Hi! I'm your Course Creation Assistant 🎓

I'll help you create a personalized course tailored to your needs. I'll ask you a few questions to understand what you're looking for.

Let's start! What topic would you like to learn about? (e.g., "Python Programming", "Digital Marketing", "Data Science")`;
  }

  /**
   * Extract information from user response
   */
  private async extractInformation(
    currentRequirements: Partial<CourseRequirements>,
    userResponse: string,
    currentStep: string
  ): Promise<Partial<CourseRequirements>> {
    const updated = { ...currentRequirements };
    const response = userResponse.toLowerCase().trim();

    switch (currentStep) {
      case 'greeting':
        // First interaction, no extraction needed
        break;

      case 'topic':
        updated.topic = userResponse.trim();
        // Try to infer level from response
        if (response.includes('beginner') || response.includes('basic') || response.includes('introduction')) {
          updated.level = 'beginner';
        } else if (response.includes('advanced') || response.includes('expert')) {
          updated.level = 'advanced';
        }
        break;

      case 'level':
        if (response.includes('beginner') || response.includes('new') || response.includes('start')) {
          updated.level = 'beginner';
        } else if (response.includes('intermediate') || response.includes('some experience')) {
          updated.level = 'intermediate';
        } else if (response.includes('advanced') || response.includes('expert')) {
          updated.level = 'advanced';
        }
        break;

      case 'objectives':
        // Extract learning objectives
        const objectives = userResponse
          .split(/[,\n]/)
          .map(obj => obj.trim())
          .filter(obj => obj.length > 0);
        updated.learningObjectives = objectives;
        break;

      case 'duration':
        // Extract duration
        const durationMatch = response.match(/(\d+)\s*(hour|week|month)/i);
        if (durationMatch) {
          const value = parseInt(durationMatch[1]);
          const unit = durationMatch[2].toLowerCase();
          
          if (unit.includes('week')) {
            updated.duration = value * 10; // Assume 10 hours per week
            updated.moduleCount = value;
          } else if (unit.includes('month')) {
            updated.duration = value * 40; // Assume 40 hours per month
            updated.moduleCount = value * 4;
          } else {
            updated.duration = value;
            updated.moduleCount = Math.ceil(value / 8); // 8 hours per module
          }
        } else if (response.includes('quick') || response.includes('short')) {
          updated.duration = 10;
          updated.moduleCount = 3;
        } else if (response.includes('comprehensive') || response.includes('detailed')) {
          updated.duration = 40;
          updated.moduleCount = 8;
        }
        break;

      case 'audience':
        updated.targetAudience = userResponse.trim();
        break;

      case 'prerequisites':
        if (response.includes('none') || response.includes('no') || response.includes('beginner')) {
          updated.prerequisites = [];
        } else {
          const prereqs = userResponse
            .split(/[,\n]/)
            .map(p => p.trim())
            .filter(p => p.length > 0);
          updated.prerequisites = prereqs;
        }
        break;

      case 'language':
        // Extract language preference
        if (response.includes('hindi')) updated.preferredLanguage = 'hi';
        else if (response.includes('telugu')) updated.preferredLanguage = 'te';
        else if (response.includes('tamil')) updated.preferredLanguage = 'ta';
        else if (response.includes('kannada')) updated.preferredLanguage = 'kn';
        else if (response.includes('bengali')) updated.preferredLanguage = 'bn';
        else updated.preferredLanguage = 'en';

        // Extract cultural context
        if (response.includes('india') || response.includes('indian')) {
          updated.culturalContext = 'indian';
        }
        break;

      case 'content_preferences':
        updated.includeQuizzes = response.includes('quiz') || response.includes('yes') || response.includes('test');
        updated.includeProjects = response.includes('project') || response.includes('practical') || response.includes('hands-on');
        break;
    }

    return updated;
  }

  /**
   * Generate next question based on current step
   */
  private async generateNextQuestion(
    step: number,
    requirements: Partial<CourseRequirements>
  ): Promise<string> {
    const currentStep = this.conversationSteps[step];

    switch (currentStep) {
      case 'topic':
        return `Great! Let's create a course on "${requirements.topic}". 

What's your current experience level with this topic?
- Beginner (just starting out)
- Intermediate (have some experience)
- Advanced (looking to master it)`;

      case 'level':
        return `Perfect! I'll design this for ${requirements.level} level.

What are your main learning goals? What do you want to achieve by the end of this course?
(You can list multiple objectives, separated by commas)`;

      case 'objectives':
        return `Excellent goals! 

How much time can you dedicate to this course?
- Quick course (10-15 hours, 3-4 modules)
- Standard course (20-30 hours, 5-6 modules)
- Comprehensive course (40+ hours, 8-10 modules)

Or tell me in weeks/months if you prefer!`;

      case 'duration':
        return `Got it! I'll structure the course for ${requirements.moduleCount} modules.

Who is this course for? (e.g., "students", "working professionals", "career switchers")`;

      case 'audience':
        return `Great! Designing for ${requirements.targetAudience}.

Are there any prerequisites or prior knowledge needed for this course?
(Type "none" if this is for complete beginners)`;

      case 'prerequisites':
        const prereqText = requirements.prerequisites?.length 
          ? `I'll make sure students have: ${requirements.prerequisites.join(', ')}`
          : "Perfect for complete beginners!";
        
        return `${prereqText}

What language would you prefer for the course content?
- English
- Hindi
- Telugu
- Tamil
- Kannada
- Bengali
- Other (please specify)`;

      case 'language':
        return `I'll prepare the course in ${this.getLanguageName(requirements.preferredLanguage || 'en')}.

Would you like to include:
- Quizzes after each module? (to test understanding)
- Hands-on projects? (for practical experience)

Just type "yes" for both, or specify which ones you'd like!`;

      case 'content_preferences':
        return this.generateSummary(requirements);

      case 'confirmation':
        return `Perfect! I'm creating your personalized course now... 🚀

This will take just a moment!`;

      default:
        return "Thank you! Your course is being created.";
    }
  }

  /**
   * Generate course summary for confirmation
   */
  private generateSummary(requirements: Partial<CourseRequirements>): string {
    const features = [];
    if (requirements.includeQuizzes) features.push('✓ Interactive quizzes');
    if (requirements.includeProjects) features.push('✓ Hands-on projects');

    return `Perfect! Here's what I'll create for you:

📚 **Course**: ${requirements.topic}
📊 **Level**: ${requirements.level}
⏱️ **Duration**: ~${requirements.duration} hours
📖 **Modules**: ${requirements.moduleCount}
🎯 **Goals**: ${requirements.learningObjectives?.slice(0, 2).join(', ')}${requirements.learningObjectives && requirements.learningObjectives.length > 2 ? '...' : ''}
👥 **For**: ${requirements.targetAudience}
🌐 **Language**: ${this.getLanguageName(requirements.preferredLanguage || 'en')}

${features.length > 0 ? `**Includes**:\n${features.join('\n')}` : ''}

Does this look good? Type "yes" to create the course, or "modify" to make changes!`;
  }

  /**
   * Get language name from code
   */
  private getLanguageName(code: string): string {
    const languages: Record<string, string> = {
      'en': 'English',
      'hi': 'Hindi',
      'te': 'Telugu',
      'ta': 'Tamil',
      'kn': 'Kannada',
      'bn': 'Bengali',
      'gu': 'Gujarati',
      'mr': 'Marathi'
    };
    return languages[code] || 'English';
  }

  /**
   * Validate if requirements are complete
   */
  validateRequirements(requirements: Partial<CourseRequirements>): {
    isValid: boolean;
    missingFields: string[];
  } {
    const requiredFields: (keyof CourseRequirements)[] = [
      'topic',
      'level',
      'duration',
      'moduleCount'
    ];

    const missingFields = requiredFields.filter(
      field => !requirements[field]
    );

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Generate smart suggestions based on topic
   */
  async generateSuggestions(topic: string): Promise<{
    suggestedLevel: string;
    suggestedDuration: number;
    suggestedModules: string[];
    relatedTopics: string[];
  }> {
    // Simple suggestion logic (can be enhanced with AI)
    const topicLower = topic.toLowerCase();
    
    let suggestedLevel = 'beginner';
    let suggestedDuration = 20;
    
    if (topicLower.includes('advanced') || topicLower.includes('expert')) {
      suggestedLevel = 'advanced';
      suggestedDuration = 40;
    } else if (topicLower.includes('intermediate')) {
      suggestedLevel = 'intermediate';
      suggestedDuration = 30;
    }

    return {
      suggestedLevel,
      suggestedDuration,
      suggestedModules: [
        `Introduction to ${topic}`,
        `Core Concepts`,
        `Practical Applications`,
        `Advanced Topics`,
        `Final Project`
      ],
      relatedTopics: []
    };
  }

  /**
   * Handle user wanting to modify requirements
   */
  handleModification(
    state: ConversationState,
    field: string
  ): ConversationState {
    // Find the step for the field to modify
    const stepIndex = this.conversationSteps.indexOf(field);
    
    if (stepIndex === -1) {
      return state;
    }

    // Reset to that step
    return {
      ...state,
      step: stepIndex,
      conversationHistory: [
        ...state.conversationHistory,
        {
          id: `msg-${Date.now()}`,
          role: 'agent',
          content: `Sure! Let's update the ${field}. ${this.generateNextQuestion(stepIndex, state.requirements)}`,
          timestamp: new Date()
        }
      ]
    };
  }
}

export const courseCreationAgent = new CourseCreationAgent();
