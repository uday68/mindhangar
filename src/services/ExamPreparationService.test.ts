import { describe, it, expect, beforeEach } from 'vitest';
import { ExamPreparationService, MockTest, MockTestResult } from './ExamPreparationService';

describe('ExamPreparationService', () => {
  let service: ExamPreparationService;

  beforeEach(() => {
    service = new ExamPreparationService();
  });

  describe('createMockTest', () => {
    it('should create a mock test for JEE Main', async () => {
      const mockTest = await service.createMockTest('JEE Main');

      expect(mockTest).toBeDefined();
      expect(mockTest.id).toContain('mock-JEE Main');
      expect(mockTest.config.exam).toBe('JEE Main');
      expect(mockTest.status).toBe('not_started');
      expect(mockTest.questions.length).toBeGreaterThan(0);
    });

    it('should create a mock test for NEET', async () => {
      const mockTest = await service.createMockTest('NEET');

      expect(mockTest).toBeDefined();
      expect(mockTest.config.exam).toBe('NEET');
      expect(mockTest.config.sections.length).toBeGreaterThan(0);
    });

    it('should include exam pattern in config', async () => {
      const mockTest = await service.createMockTest('JEE Main');

      expect(mockTest.config.duration).toBeGreaterThan(0);
      expect(mockTest.config.totalMarks).toBeGreaterThan(0);
      expect(mockTest.config.negativeMarking).toBe(true);
    });

    it('should generate questions for all sections', async () => {
      const mockTest = await service.createMockTest('JEE Main');

      const subjects = new Set(mockTest.questions.map(q => q.subject));
      expect(subjects.size).toBeGreaterThan(0);
    });
  });

  describe('startMockTest', () => {
    it('should start a mock test', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      const startedTest = service.startMockTest(mockTest.id);

      expect(startedTest.status).toBe('in_progress');
      expect(startedTest.startTime).toBeInstanceOf(Date);
    });

    it('should throw error for non-existent test', () => {
      expect(() => service.startMockTest('invalid-id')).toThrow();
    });
  });

  describe('submitMockTest', () => {
    it('should submit a mock test and calculate results', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      service.startMockTest(mockTest.id);

      const answers = new Map<string, string | number>();
      mockTest.questions.forEach(q => {
        answers.set(q.id, q.correctAnswer);
      });

      const result = service.submitMockTest(mockTest.id, answers);

      expect(result).toBeDefined();
      expect(result.testId).toBe(mockTest.id);
      expect(result.correct).toBe(mockTest.questions.length);
      expect(result.incorrect).toBe(0);
    });

    it('should calculate score with negative marking', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      service.startMockTest(mockTest.id);

      const answers = new Map<string, string | number>();
      // Answer first question correctly, second incorrectly
      if (mockTest.questions.length >= 1) {
        answers.set(mockTest.questions[0].id, mockTest.questions[0].correctAnswer);
      }
      if (mockTest.questions.length >= 2) {
        answers.set(mockTest.questions[1].id, 'wrong answer');
      } else {
        // If only one question, just check that scoring works
        expect(mockTest.questions.length).toBeGreaterThan(0);
      }

      const result = service.submitMockTest(mockTest.id, answers);

      if (mockTest.questions.length >= 2) {
        expect(result.correct).toBe(1);
        expect(result.incorrect).toBe(1);
      }
      expect(result.score).toBeLessThanOrEqual(result.maxScore);
    });

    it('should handle unattempted questions', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      service.startMockTest(mockTest.id);

      const answers = new Map<string, string | number>();
      // Only answer first question
      if (mockTest.questions.length > 0) {
        answers.set(mockTest.questions[0].id, mockTest.questions[0].correctAnswer);
      }

      const result = service.submitMockTest(mockTest.id, answers);

      expect(result.attempted).toBe(1);
      expect(result.unattempted).toBe(mockTest.questions.length - 1);
    });

    it('should calculate percentage correctly', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      service.startMockTest(mockTest.id);

      const answers = new Map<string, string | number>();
      mockTest.questions.forEach(q => {
        answers.set(q.id, q.correctAnswer);
      });

      const result = service.submitMockTest(mockTest.id, answers);

      expect(result.percentage).toBeGreaterThan(0);
      expect(result.percentage).toBeLessThanOrEqual(100);
    });

    it('should include section-wise performance', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      service.startMockTest(mockTest.id);

      const answers = new Map<string, string | number>();
      mockTest.questions.forEach(q => {
        answers.set(q.id, q.correctAnswer);
      });

      const result = service.submitMockTest(mockTest.id, answers);

      expect(result.sectionWisePerformance).toBeDefined();
      expect(Array.isArray(result.sectionWisePerformance)).toBe(true);
    });

    it('should include subject-wise performance', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      service.startMockTest(mockTest.id);

      const answers = new Map<string, string | number>();
      mockTest.questions.forEach(q => {
        answers.set(q.id, q.correctAnswer);
      });

      const result = service.submitMockTest(mockTest.id, answers);

      expect(result.subjectWisePerformance).toBeDefined();
      expect(result.subjectWisePerformance.length).toBeGreaterThan(0);
      result.subjectWisePerformance.forEach(perf => {
        expect(perf.accuracy).toBeGreaterThanOrEqual(0);
        expect(perf.accuracy).toBeLessThanOrEqual(100);
      });
    });

    it('should include difficulty-wise performance', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      service.startMockTest(mockTest.id);

      const answers = new Map<string, string | number>();
      mockTest.questions.forEach(q => {
        answers.set(q.id, q.correctAnswer);
      });

      const result = service.submitMockTest(mockTest.id, answers);

      expect(result.difficultyWisePerformance).toBeDefined();
      expect(Array.isArray(result.difficultyWisePerformance)).toBe(true);
    });
  });

  describe('getMockTest', () => {
    it('should retrieve a mock test by ID', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      const retrieved = service.getMockTest(mockTest.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(mockTest.id);
    });

    it('should return undefined for non-existent test', () => {
      const retrieved = service.getMockTest('invalid-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getTestResult', () => {
    it('should retrieve test result by ID', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      service.startMockTest(mockTest.id);

      const answers = new Map<string, string | number>();
      mockTest.questions.forEach(q => {
        answers.set(q.id, q.correctAnswer);
      });

      service.submitMockTest(mockTest.id, answers);
      const result = service.getTestResult(mockTest.id);

      expect(result).toBeDefined();
      expect(result?.testId).toBe(mockTest.id);
    });

    it('should return undefined for non-existent result', () => {
      const result = service.getTestResult('invalid-id');
      expect(result).toBeUndefined();
    });
  });

  describe('getExamResults', () => {
    it('should get all results for an exam', async () => {
      // Use same service instance for both tests
      const localService = new ExamPreparationService();
      
      const mockTest1 = await localService.createMockTest('JEE Main');
      localService.startMockTest(mockTest1.id);

      const answers1 = new Map<string, string | number>();
      mockTest1.questions.forEach(q => answers1.set(q.id, q.correctAnswer));
      localService.submitMockTest(mockTest1.id, answers1);

      const mockTest2 = await localService.createMockTest('JEE Main');
      localService.startMockTest(mockTest2.id);

      const answers2 = new Map<string, string | number>();
      mockTest2.questions.forEach(q => answers2.set(q.id, q.correctAnswer));
      localService.submitMockTest(mockTest2.id, answers2);

      const results = localService.getExamResults('JEE Main');

      expect(results.length).toBe(2);
      expect(results.every(r => r.exam === 'JEE Main')).toBe(true);
    });

    it('should return empty array for exam with no results', () => {
      const results = service.getExamResults('CAT');
      expect(results).toEqual([]);
    });
  });

  describe('generateStudyRecommendations', () => {
    it('should generate default recommendations for new exam', () => {
      const recommendations = service.generateStudyRecommendations('JEE Main');

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should generate recommendations based on test performance', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      service.startMockTest(mockTest.id);

      const answers = new Map<string, string | number>();
      // Answer some questions incorrectly to generate recommendations
      mockTest.questions.forEach((q, index) => {
        answers.set(q.id, index % 2 === 0 ? q.correctAnswer : 'wrong');
      });

      service.submitMockTest(mockTest.id, answers);
      const recommendations = service.generateStudyRecommendations('JEE Main');

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should prioritize recommendations by importance', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      service.startMockTest(mockTest.id);

      const answers = new Map<string, string | number>();
      mockTest.questions.forEach((q, index) => {
        answers.set(q.id, index % 3 === 0 ? q.correctAnswer : 'wrong');
      });

      service.submitMockTest(mockTest.id, answers);
      const recommendations = service.generateStudyRecommendations('JEE Main');

      if (recommendations.length > 1) {
        const priorities = recommendations.map(r => r.priority);
        const priorityOrder = ['High', 'Medium', 'Low'];
        
        for (let i = 0; i < priorities.length - 1; i++) {
          const currentIndex = priorityOrder.indexOf(priorities[i]);
          const nextIndex = priorityOrder.indexOf(priorities[i + 1]);
          expect(currentIndex).toBeLessThanOrEqual(nextIndex);
        }
      }
    });

    it('should include resources in recommendations', () => {
      const recommendations = service.generateStudyRecommendations('JEE Main');

      recommendations.forEach(rec => {
        expect(rec.resources).toBeDefined();
        expect(Array.isArray(rec.resources)).toBe(true);
      });
    });
  });

  describe('getPerformanceAnalytics', () => {
    it('should return zero analytics for no tests', () => {
      const analytics = service.getPerformanceAnalytics('CAT');

      expect(analytics.totalTests).toBe(0);
      expect(analytics.averageScore).toBe(0);
      expect(analytics.averagePercentage).toBe(0);
    });

    it('should calculate analytics across multiple tests', async () => {
      // Use same service instance for both tests
      const localService = new ExamPreparationService();
      
      const mockTest1 = await localService.createMockTest('JEE Main');
      localService.startMockTest(mockTest1.id);

      const answers1 = new Map<string, string | number>();
      mockTest1.questions.forEach(q => answers1.set(q.id, q.correctAnswer));
      localService.submitMockTest(mockTest1.id, answers1);

      const mockTest2 = await localService.createMockTest('JEE Main');
      localService.startMockTest(mockTest2.id);

      const answers2 = new Map<string, string | number>();
      mockTest2.questions.forEach(q => answers2.set(q.id, q.correctAnswer));
      localService.submitMockTest(mockTest2.id, answers2);

      const analytics = localService.getPerformanceAnalytics('JEE Main');

      expect(analytics.totalTests).toBe(2);
      expect(analytics.averageScore).toBeGreaterThan(0);
      expect(analytics.bestScore).toBeGreaterThan(0);
    });

    it('should calculate improvement trend', async () => {
      const mockTest1 = await service.createMockTest('JEE Main');
      const mockTest2 = await service.createMockTest('JEE Main');

      service.startMockTest(mockTest1.id);
      
      // First test: 50% correct
      const answers1 = new Map<string, string | number>();
      mockTest1.questions.forEach((q, i) => {
        answers1.set(q.id, i % 2 === 0 ? q.correctAnswer : 'wrong');
      });

      service.submitMockTest(mockTest1.id, answers1);

      service.startMockTest(mockTest2.id);

      // Second test: 100% correct
      const answers2 = new Map<string, string | number>();
      mockTest2.questions.forEach(q => {
        answers2.set(q.id, q.correctAnswer);
      });

      service.submitMockTest(mockTest2.id, answers2);

      const analytics = service.getPerformanceAnalytics('JEE Main');

      expect(analytics.improvement).toBeGreaterThanOrEqual(0);
    });

    it('should include subject trends', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      service.startMockTest(mockTest.id);

      const answers = new Map<string, string | number>();
      mockTest.questions.forEach(q => answers.set(q.id, q.correctAnswer));

      service.submitMockTest(mockTest.id, answers);

      const analytics = service.getPerformanceAnalytics('JEE Main');

      expect(analytics.subjectTrends).toBeDefined();
      expect(Array.isArray(analytics.subjectTrends)).toBe(true);
    });

    it('should include difficulty trends', async () => {
      const mockTest = await service.createMockTest('JEE Main');
      service.startMockTest(mockTest.id);

      const answers = new Map<string, string | number>();
      mockTest.questions.forEach(q => answers.set(q.id, q.correctAnswer));

      service.submitMockTest(mockTest.id, answers);

      const analytics = service.getPerformanceAnalytics('JEE Main');

      expect(analytics.difficultyTrends).toBeDefined();
      expect(Array.isArray(analytics.difficultyTrends)).toBe(true);
    });
  });

  describe('Question Bank', () => {
    it('should have questions for JEE Main', async () => {
      const mockTest = await service.createMockTest('JEE Main');

      expect(mockTest.questions.length).toBeGreaterThan(0);
      mockTest.questions.forEach(q => {
        expect(q.id).toBeDefined();
        expect(q.question).toBeDefined();
        expect(q.correctAnswer).toBeDefined();
        expect(q.marks).toBeGreaterThan(0);
      });
    });

    it('should have questions for NEET', async () => {
      const mockTest = await service.createMockTest('NEET');

      expect(mockTest.questions.length).toBeGreaterThan(0);
      mockTest.questions.forEach(q => {
        expect(q.subject).toBeDefined();
        expect(q.difficulty).toBeDefined();
      });
    });
  });
});
