/**
 * General Interaction Agent
 * Collects student details after login through conversational AI
 */

interface StudentDetails {
  fullName: string;
  grade: string;
  board: 'CBSE' | 'ICSE' | 'State' | '';
  subjects: string[];
  goals: string[];
  studyTimePerDay: number; // minutes
  preferredLanguage: string;
  examDate?: string;
  strengths: string[];
  weaknesses: string[];
}

type ConversationStep = 
  | 'greeting'
  | 'name'
  | 'grade'
  | 'board'
  | 'subjects'
  | 'goals'
  | 'study_time'
  | 'strengths'
  | 'weaknesses'
  | 'exam_date'
  | 'confirmation'
  | 'complete';

interface AgentState {
  currentStep: ConversationStep;
  collectedData: Partial<StudentDetails>;
  conversationHistory: Array<{ role: 'agent' | 'user'; message: string }>;
}

class GeneralInteractionAgent {
  private state: AgentState;

  constructor() {
    this.state = {
      currentStep: 'greeting',
      collectedData: {},
      conversationHistory: []
    };
  }

  /**
   * Initialize conversation
   */
  start(userName?: string): string {
    this.state.currentStep = 'greeting';
    const greeting = userName 
      ? `Hi ${userName}! 👋 Welcome to MindHangar! I'm your AI learning assistant, and I'm here to help you succeed.`
      : `Hi there! 👋 Welcome to MindHangar! I'm your AI learning assistant.`;
    
    const message = `${greeting}\n\nTo personalize your learning experience, I'd like to know more about you. This will only take a minute!\n\nLet's start with your full name. What should I call you?`;
    
    this.state.conversationHistory.push({ role: 'agent', message });
    this.state.currentStep = 'name';
    return message;
  }

  /**
   * Process user response and move to next step
   */
  processResponse(userInput: string): { message: string; isComplete: boolean; data?: StudentDetails } {
    const trimmedInput = userInput.trim();
    
    // Add user message to history
    this.state.conversationHistory.push({ role: 'user', message: trimmedInput });

    let response = '';
    let isComplete = false;

    switch (this.state.currentStep) {
      case 'name':
        response = this.handleName(trimmedInput);
        break;
      case 'grade':
        response = this.handleGrade(trimmedInput);
        break;
      case 'board':
        response = this.handleBoard(trimmedInput);
        break;
      case 'subjects':
        response = this.handleSubjects(trimmedInput);
        break;
      case 'goals':
        response = this.handleGoals(trimmedInput);
        break;
      case 'study_time':
        response = this.handleStudyTime(trimmedInput);
        break;
      case 'strengths':
        response = this.handleStrengths(trimmedInput);
        break;
      case 'weaknesses':
        response = this.handleWeaknesses(trimmedInput);
        break;
      case 'exam_date':
        response = this.handleExamDate(trimmedInput);
        break;
      case 'confirmation':
        response = this.handleConfirmation(trimmedInput);
        // Check if confirmation handler marked conversation as complete
        isComplete = this.state.currentStep === 'complete';
        break;
      default:
        response = "I'm not sure what to ask next. Let me start over.";
        this.state.currentStep = 'greeting';
    }

    this.state.conversationHistory.push({ role: 'agent', message: response });

    return {
      message: response,
      isComplete,
      data: isComplete ? (this.state.collectedData as StudentDetails) : undefined
    };
  }

  private handleName(input: string): string {
    // Validate name (at least 2 characters, only letters and spaces)
    if (input.length < 2 || !/^[a-zA-Z\s]+$/.test(input)) {
      return "Please enter a valid name (at least 2 characters, letters only).";
    }

    this.state.collectedData.fullName = input;
    this.state.currentStep = 'grade';
    
    return `Nice to meet you, ${input}! 😊\n\nWhich grade/class are you currently in? (e.g., 8, 9, 10, 11, 12, or College)`;
  }

  private handleGrade(input: string): string {
    // Extract grade from input
    const gradeMatch = input.match(/(\d+|college|graduation|undergraduate)/i);
    
    if (!gradeMatch) {
      return "Please specify your grade/class (e.g., 8, 9, 10, 11, 12, or College).";
    }

    this.state.collectedData.grade = gradeMatch[0];
    this.state.currentStep = 'board';
    
    return `Great! You're in ${gradeMatch[0]}.\n\nWhich educational board are you following?\n1. CBSE\n2. ICSE\n3. State Board\n\nJust type the number or name.`;
  }

  private handleBoard(input: string): string {
    const lowerInput = input.toLowerCase();
    let board: 'CBSE' | 'ICSE' | 'State' | '' = '';

    if (lowerInput.includes('cbse') || lowerInput === '1') {
      board = 'CBSE';
    } else if (lowerInput.includes('icse') || lowerInput === '2') {
      board = 'ICSE';
    } else if (lowerInput.includes('state') || lowerInput === '3') {
      board = 'State';
    } else {
      return "Please choose from:\n1. CBSE\n2. ICSE\n3. State Board";
    }

    this.state.collectedData.board = board;
    this.state.currentStep = 'subjects';
    
    return `Perfect! ${board} board it is.\n\nWhat subjects are you currently studying? Please list them separated by commas.\n(e.g., Mathematics, Physics, Chemistry, Biology, English)`;
  }

  private handleSubjects(input: string): string {
    // Split by comma and clean up
    const subjects = input.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    if (subjects.length === 0) {
      return "Please list at least one subject (separated by commas).";
    }

    this.state.collectedData.subjects = subjects;
    this.state.currentStep = 'goals';
    
    return `Excellent! You're studying ${subjects.join(', ')}.\n\nWhat are your learning goals? What do you want to achieve?\n(e.g., Score 90%+ in board exams, Crack JEE, Improve in Mathematics, etc.)`;
  }

  private handleGoals(input: string): string {
    // Split by comma or newline
    const goals = input.split(/[,\n]/).map(g => g.trim()).filter(g => g.length > 0);
    
    if (goals.length === 0) {
      return "Please share at least one learning goal.";
    }

    this.state.collectedData.goals = goals;
    this.state.currentStep = 'study_time';
    
    return `Amazing goals! 🎯 I'll help you achieve them.\n\nHow much time can you dedicate to studying each day?\n(e.g., 1 hour, 2 hours, 3 hours, etc.)`;
  }

  private handleStudyTime(input: string): string {
    // Extract number from input
    const timeMatch = input.match(/(\d+)/);
    
    if (!timeMatch) {
      return "Please specify the number of hours (e.g., 1, 2, 3).";
    }

    const hours = parseInt(timeMatch[0]);
    if (hours < 1 || hours > 12) {
      return "Please enter a realistic study time between 1 and 12 hours.";
    }

    this.state.collectedData.studyTimePerDay = hours * 60; // Convert to minutes
    this.state.currentStep = 'strengths';
    
    return `Great! ${hours} hour${hours > 1 ? 's' : ''} per day is a good commitment.\n\nWhat are your strengths? Which subjects or topics do you excel at?\n(e.g., Mathematics, Problem Solving, Memory, etc.)`;
  }

  private handleStrengths(input: string): string {
    const strengths = input.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);
    
    if (strengths.length === 0) {
      return "Please share at least one strength.";
    }

    this.state.collectedData.strengths = strengths;
    this.state.currentStep = 'weaknesses';
    
    return `Awesome! You're strong in ${strengths.join(', ')}.\n\nNow, what areas would you like to improve? Where do you face challenges?\n(e.g., Physics concepts, Time management, Concentration, etc.)`;
  }

  private handleWeaknesses(input: string): string {
    const weaknesses = input.split(/[,\n]/).map(w => w.trim()).filter(w => w.length > 0);
    
    if (weaknesses.length === 0) {
      return "Please share at least one area you'd like to improve.";
    }

    this.state.collectedData.weaknesses = weaknesses;
    this.state.currentStep = 'exam_date';
    
    return `Don't worry! We'll work on improving ${weaknesses.join(', ')} together.\n\nDo you have any upcoming exams? If yes, when? (e.g., March 2026, or type 'no' if not applicable)`;
  }

  private handleExamDate(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (!lowerInput.includes('no') && !lowerInput.includes('not')) {
      this.state.collectedData.examDate = input;
    }

    this.state.currentStep = 'confirmation';
    
    const summary = this.generateSummary();
    return `Perfect! Let me confirm the details:\n\n${summary}\n\nIs everything correct? (Type 'yes' to confirm or 'no' to start over)`;
  }

  private handleConfirmation(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('yes') || lowerInput.includes('correct') || lowerInput.includes('confirm')) {
      this.state.currentStep = 'complete';
      return `🎉 Awesome! Your profile is all set up!\n\nI've personalized your learning experience based on your details. Let's start your learning journey!\n\nYou can now:\n✅ Browse courses tailored for you\n✅ Get AI-powered study recommendations\n✅ Track your progress\n✅ Access personalized learning paths\n\nLet's achieve your goals together! 💪`;
    } else {
      // Reset and start over
      this.state.collectedData = {};
      this.state.currentStep = 'greeting';
      return this.start(this.state.collectedData.fullName);
    }
  }

  private generateSummary(): string {
    const data = this.state.collectedData;
    return `
📝 Name: ${data.fullName}
🎓 Grade: ${data.grade}
📚 Board: ${data.board}
📖 Subjects: ${data.subjects?.join(', ')}
🎯 Goals: ${data.goals?.join(', ')}
⏰ Study Time: ${(data.studyTimePerDay || 0) / 60} hours/day
💪 Strengths: ${data.strengths?.join(', ')}
📈 Areas to Improve: ${data.weaknesses?.join(', ')}
${data.examDate ? `📅 Exam Date: ${data.examDate}` : ''}
    `.trim();
  }

  /**
   * Get current state
   */
  getState(): AgentState {
    return this.state;
  }

  /**
   * Reset agent
   */
  reset(): void {
    this.state = {
      currentStep: 'greeting',
      collectedData: {},
      conversationHistory: []
    };
  }

  /**
   * Get quick reply suggestions based on current step
   */
  getQuickReplies(): string[] {
    switch (this.state.currentStep) {
      case 'grade':
        return ['Class 10', 'Class 11', 'Class 12', 'College'];
      case 'board':
        return ['CBSE', 'ICSE', 'State Board'];
      case 'study_time':
        return ['1 hour', '2 hours', '3 hours', '4 hours'];
      case 'exam_date':
        return ['March 2026', 'May 2026', 'No upcoming exams'];
      case 'confirmation':
        return ['Yes, correct!', 'No, start over'];
      default:
        return [];
    }
  }
}

export const generalInteractionAgent = new GeneralInteractionAgent();
export type { StudentDetails, ConversationStep, AgentState };
