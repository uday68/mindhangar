import { CompetitiveExam, ExamMapping, curriculumAdapter } from './CurriculumAdapter';

/**
 * Question difficulty levels
 */
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';

/**
 * Question types for competitive exams
 */
export type ExamQuestionType = 'MCQ' | 'Numerical' | 'Integer' | 'True/False' | 'Assertion-Reason';

/**
 * Exam question structure
 */
export interface ExamQuestion {
  id: string;
  type: ExamQuestionType;
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  marks: number;
  timeAllocation: number; // in seconds
  previousYearAppearance?: {
    year: number;
    exam: CompetitiveExam;
  }[];
}

/**
 * Mock test configuration
 */
export interface MockTestConfig {
  exam: CompetitiveExam;
  duration: number; // in minutes
  totalMarks: number;
  sections: MockTestSection[];
  negativeMarking: boolean;
  negativeMarkingRatio?: number; // e.g., 0.25 for -1/4
}

export interface MockTestSection {
  name: string;
  subject: string;
  questionCount: number;
  marksPerQuestion: number;
  timeAllocation: number; // in minutes
  questionTypes: ExamQuestionType[];
}

/**
 * Mock test instance
 */
export interface MockTest {
  id: string;
  config: MockTestConfig;
  questions: ExamQuestion[];
  startTime?: Date;
  endTime?: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
}

/**
 * Mock test result
 */
export interface MockTestResult {
  testId: string;
  exam: CompetitiveExam;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  maxScore: number;
  percentage: number;
  timeTaken: number; // in minutes
  sectionWisePerformance: SectionPerformance[];
  subjectWisePerformance: SubjectPerformance[];
  difficultyWisePerformance: DifficultyPerformance[];
  rank?: number;
  percentile?: number;
}

export interface SectionPerformance {
  section: string;
  attempted: number;
  correct: number;
  score: number;
  maxScore: number;
  accuracy: number;
}

export interface SubjectPerformance {
  subject: string;
  attempted: number;
  correct: number;
  score: number;
  maxScore: number;
  accuracy: number;
  strongTopics: string[];
  weakTopics: string[];
}

export interface DifficultyPerformance {
  difficulty: QuestionDifficulty;
  attempted: number;
  correct: number;
  accuracy: number;
}

/**
 * Study recommendation
 */
export interface StudyRecommendation {
  priority: 'High' | 'Medium' | 'Low';
  subject: string;
  topics: string[];
  reason: string;
  estimatedHours: number;
  resources: string[];
}

/**
 * Exam Preparation Service
 * Handles competitive exam preparation, mock tests, and performance analytics
 */
export class ExamPreparationService {
  private mockTests: Map<string, MockTest>;
  private testResults: Map<string, MockTestResult>;
  private questionBank: Map<CompetitiveExam, ExamQuestion[]>;
  private testCounter: number;

  constructor() {
    this.mockTests = new Map();
    this.testResults = new Map();
    this.questionBank = new Map();
    this.testCounter = 0;
    this.initializeQuestionBank();
  }

  /**
   * Create a mock test for a competitive exam
   */
  async createMockTest(exam: CompetitiveExam): Promise<MockTest> {
    const examMapping = await curriculumAdapter.mapCompetitiveExam(exam);
    const config = this.createMockTestConfig(examMapping);
    const questions = this.generateQuestions(exam, config);

    this.testCounter++;
    const mockTest: MockTest = {
      id: `mock-${exam}-${this.testCounter}`,
      config,
      questions,
      status: 'not_started'
    };

    this.mockTests.set(mockTest.id, mockTest);
    return mockTest;
  }

  /**
   * Start a mock test
   */
  startMockTest(testId: string): MockTest {
    const test = this.mockTests.get(testId);
    if (!test) {
      throw new Error(`Mock test ${testId} not found`);
    }

    test.startTime = new Date();
    test.status = 'in_progress';
    this.mockTests.set(testId, test);
    return test;
  }

  /**
   * Submit a mock test and calculate results
   */
  submitMockTest(testId: string, answers: Map<string, string | number>): MockTestResult {
    const test = this.mockTests.get(testId);
    if (!test) {
      throw new Error(`Mock test ${testId} not found`);
    }

    test.endTime = new Date();
    test.status = 'completed';

    const result = this.calculateTestResult(test, answers);
    this.testResults.set(testId, result);
    this.mockTests.set(testId, test);

    return result;
  }

  /**
   * Get mock test by ID
   */
  getMockTest(testId: string): MockTest | undefined {
    return this.mockTests.get(testId);
  }

  /**
   * Get test result by ID
   */
  getTestResult(testId: string): MockTestResult | undefined {
    return this.testResults.get(testId);
  }

  /**
   * Get all test results for an exam
   */
  getExamResults(exam: CompetitiveExam): MockTestResult[] {
    return Array.from(this.testResults.values()).filter(r => r.exam === exam);
  }

  /**
   * Generate study recommendations based on test performance
   */
  generateStudyRecommendations(exam: CompetitiveExam): StudyRecommendation[] {
    const results = this.getExamResults(exam);
    if (results.length === 0) {
      return this.getDefaultRecommendations(exam);
    }

    const recommendations: StudyRecommendation[] = [];
    const latestResult = results[results.length - 1];

    // Analyze weak subjects
    latestResult.subjectWisePerformance.forEach(perf => {
      if (perf.accuracy < 60) {
        recommendations.push({
          priority: 'High',
          subject: perf.subject,
          topics: perf.weakTopics,
          reason: `Low accuracy (${perf.accuracy.toFixed(1)}%) in ${perf.subject}`,
          estimatedHours: 10,
          resources: this.getResourcesForSubject(exam, perf.subject)
        });
      } else if (perf.accuracy < 75) {
        recommendations.push({
          priority: 'Medium',
          subject: perf.subject,
          topics: perf.weakTopics,
          reason: `Moderate accuracy (${perf.accuracy.toFixed(1)}%) in ${perf.subject}`,
          estimatedHours: 5,
          resources: this.getResourcesForSubject(exam, perf.subject)
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get performance analytics across multiple tests
   */
  getPerformanceAnalytics(exam: CompetitiveExam): PerformanceAnalytics {
    const results = this.getExamResults(exam);
    
    if (results.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        averagePercentage: 0,
        bestScore: 0,
        improvement: 0,
        consistencyScore: 0,
        subjectTrends: [],
        difficultyTrends: []
      };
    }

    const totalTests = results.length;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalTests;
    const averagePercentage = results.reduce((sum, r) => sum + r.percentage, 0) / totalTests;
    const bestScore = Math.max(...results.map(r => r.score));
    
    // Calculate improvement (first test vs last test)
    const improvement = results.length > 1 
      ? ((results[results.length - 1].percentage - results[0].percentage) / results[0].percentage) * 100
      : 0;

    // Calculate consistency (lower standard deviation = more consistent)
    const percentages = results.map(r => r.percentage);
    const stdDev = this.calculateStandardDeviation(percentages);
    const consistencyScore = Math.max(0, 100 - stdDev);

    return {
      totalTests,
      averageScore,
      averagePercentage,
      bestScore,
      improvement,
      consistencyScore,
      subjectTrends: this.calculateSubjectTrends(results),
      difficultyTrends: this.calculateDifficultyTrends(results)
    };
  }

  // Private helper methods

  private createMockTestConfig(examMapping: ExamMapping): MockTestConfig {
    return {
      exam: examMapping.exam,
      duration: examMapping.pattern.duration,
      totalMarks: examMapping.pattern.totalMarks,
      sections: examMapping.pattern.sections.map(section => ({
        name: section.name,
        subject: section.name,
        questionCount: section.questionTypes.reduce((sum, qt) => sum + qt.count, 0),
        marksPerQuestion: section.questionTypes[0]?.marksPerQuestion || 4,
        timeAllocation: examMapping.pattern.duration / examMapping.pattern.sections.length,
        questionTypes: section.questionTypes.map(qt => qt.type as ExamQuestionType)
      })),
      negativeMarking: true,
      negativeMarkingRatio: 0.25
    };
  }

  private generateQuestions(exam: CompetitiveExam, config: MockTestConfig): ExamQuestion[] {
    const questions: ExamQuestion[] = [];
    const questionBank = this.questionBank.get(exam) || [];

    config.sections.forEach(section => {
      const sectionQuestions = questionBank
        .filter(q => q.subject === section.subject)
        .slice(0, section.questionCount);

      questions.push(...sectionQuestions);
    });

    return questions;
  }

  private calculateTestResult(test: MockTest, answers: Map<string, string | number>): MockTestResult {
    let correct = 0;
    let incorrect = 0;
    let attempted = 0;
    let score = 0;

    const sectionPerformance = new Map<string, SectionPerformance>();
    const subjectPerformance = new Map<string, SubjectPerformance>();
    const difficultyPerformance = new Map<QuestionDifficulty, DifficultyPerformance>();

    test.questions.forEach(question => {
      const userAnswer = answers.get(question.id);
      
      if (userAnswer !== undefined) {
        attempted++;
        
        if (String(userAnswer) === String(question.correctAnswer)) {
          correct++;
          score += question.marks;
        } else {
          incorrect++;
          if (test.config.negativeMarking && test.config.negativeMarkingRatio) {
            score -= question.marks * test.config.negativeMarkingRatio;
          }
        }
      }

      // Update performance maps
      this.updatePerformanceMaps(
        question,
        userAnswer,
        sectionPerformance,
        subjectPerformance,
        difficultyPerformance
      );
    });

    const timeTaken = test.startTime && test.endTime
      ? (test.endTime.getTime() - test.startTime.getTime()) / (1000 * 60)
      : 0;

    return {
      testId: test.id,
      exam: test.config.exam,
      totalQuestions: test.questions.length,
      attempted,
      correct,
      incorrect,
      unattempted: test.questions.length - attempted,
      score: Math.max(0, score),
      maxScore: test.config.totalMarks,
      percentage: (score / test.config.totalMarks) * 100,
      timeTaken,
      sectionWisePerformance: Array.from(sectionPerformance.values()),
      subjectWisePerformance: Array.from(subjectPerformance.values()),
      difficultyWisePerformance: Array.from(difficultyPerformance.values())
    };
  }

  private updatePerformanceMaps(
    question: ExamQuestion,
    userAnswer: string | number | undefined,
    sectionPerformance: Map<string, SectionPerformance>,
    subjectPerformance: Map<string, SubjectPerformance>,
    difficultyPerformance: Map<QuestionDifficulty, DifficultyPerformance>
  ): void {
    const isCorrect = userAnswer !== undefined && String(userAnswer) === String(question.correctAnswer);
    const isAttempted = userAnswer !== undefined;

    // Update subject performance
    if (!subjectPerformance.has(question.subject)) {
      subjectPerformance.set(question.subject, {
        subject: question.subject,
        attempted: 0,
        correct: 0,
        score: 0,
        maxScore: 0,
        accuracy: 0,
        strongTopics: [],
        weakTopics: []
      });
    }

    const subjPerf = subjectPerformance.get(question.subject)!;
    subjPerf.maxScore += question.marks;
    if (isAttempted) {
      subjPerf.attempted++;
      if (isCorrect) {
        subjPerf.correct++;
        subjPerf.score += question.marks;
      }
    }
    subjPerf.accuracy = subjPerf.attempted > 0 ? (subjPerf.correct / subjPerf.attempted) * 100 : 0;

    // Update difficulty performance
    if (!difficultyPerformance.has(question.difficulty)) {
      difficultyPerformance.set(question.difficulty, {
        difficulty: question.difficulty,
        attempted: 0,
        correct: 0,
        accuracy: 0
      });
    }

    const diffPerf = difficultyPerformance.get(question.difficulty)!;
    if (isAttempted) {
      diffPerf.attempted++;
      if (isCorrect) {
        diffPerf.correct++;
      }
    }
    diffPerf.accuracy = diffPerf.attempted > 0 ? (diffPerf.correct / diffPerf.attempted) * 100 : 0;
  }

  private getDefaultRecommendations(exam: CompetitiveExam): StudyRecommendation[] {
    const examMapping = this.questionBank.get(exam);
    if (!examMapping) return [];

    return [
      {
        priority: 'High',
        subject: 'All Subjects',
        topics: ['Complete syllabus coverage'],
        reason: 'No test history available. Start with comprehensive preparation.',
        estimatedHours: 100,
        resources: ['NCERT textbooks', 'Standard reference books']
      }
    ];
  }

  private getResourcesForSubject(_exam: CompetitiveExam, subject: string): string[] {
    const resourceMap: Record<string, string[]> = {
      'Physics': ['HC Verma', 'DC Pandey', 'NCERT Physics'],
      'Chemistry': ['NCERT Chemistry', 'OP Tandon', 'MS Chouhan'],
      'Mathematics': ['RD Sharma', 'NCERT Mathematics', 'Cengage'],
      'Biology': ['NCERT Biology', 'Trueman\'s Biology', 'Pradeep Biology']
    };

    return resourceMap[subject] || ['Standard textbooks'];
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateSubjectTrends(results: MockTestResult[]): SubjectTrend[] {
    const subjectMap = new Map<string, number[]>();

    results.forEach(result => {
      result.subjectWisePerformance.forEach(perf => {
        if (!subjectMap.has(perf.subject)) {
          subjectMap.set(perf.subject, []);
        }
        subjectMap.get(perf.subject)!.push(perf.accuracy);
      });
    });

    return Array.from(subjectMap.entries()).map(([subject, accuracies]) => ({
      subject,
      trend: this.calculateTrend(accuracies),
      averageAccuracy: accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    }));
  }

  private calculateDifficultyTrends(results: MockTestResult[]): DifficultyTrend[] {
    const difficultyMap = new Map<QuestionDifficulty, number[]>();

    results.forEach(result => {
      result.difficultyWisePerformance.forEach(perf => {
        if (!difficultyMap.has(perf.difficulty)) {
          difficultyMap.set(perf.difficulty, []);
        }
        difficultyMap.get(perf.difficulty)!.push(perf.accuracy);
      });
    });

    return Array.from(difficultyMap.entries()).map(([difficulty, accuracies]) => ({
      difficulty,
      trend: this.calculateTrend(accuracies),
      averageAccuracy: accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    }));
  }

  private calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  private initializeQuestionBank(): void {
    // Initialize with sample questions for JEE Main
    this.questionBank.set('JEE Main', [
      {
        id: 'jee-phy-1',
        type: 'MCQ',
        subject: 'Physics',
        topic: 'Mechanics',
        difficulty: 'Medium',
        question: 'A particle moves in a straight line with constant acceleration. If it covers 10m in 2s and 20m in next 2s, what is its acceleration?',
        options: ['2.5 m/s²', '5 m/s²', '7.5 m/s²', '10 m/s²'],
        correctAnswer: '2.5 m/s²',
        explanation: 'Using equations of motion: s = ut + (1/2)at²',
        marks: 4,
        timeAllocation: 120
      }
    ]);

    // Initialize for NEET
    this.questionBank.set('NEET', [
      {
        id: 'neet-bio-1',
        type: 'MCQ',
        subject: 'Biology',
        topic: 'Cell Biology',
        difficulty: 'Easy',
        question: 'Which organelle is known as the powerhouse of the cell?',
        options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'],
        correctAnswer: 'Mitochondria',
        explanation: 'Mitochondria produce ATP through cellular respiration',
        marks: 4,
        timeAllocation: 60
      }
    ]);
  }
}

// Supporting interfaces
export interface PerformanceAnalytics {
  totalTests: number;
  averageScore: number;
  averagePercentage: number;
  bestScore: number;
  improvement: number;
  consistencyScore: number;
  subjectTrends: SubjectTrend[];
  difficultyTrends: DifficultyTrend[];
}

export interface SubjectTrend {
  subject: string;
  trend: 'improving' | 'declining' | 'stable';
  averageAccuracy: number;
}

export interface DifficultyTrend {
  difficulty: QuestionDifficulty;
  trend: 'improving' | 'declining' | 'stable';
  averageAccuracy: number;
}

// Singleton instance
export const examPreparationService = new ExamPreparationService();
