import { describe, it, expect, beforeEach } from 'vitest';
import { CurriculumAdapter, EducationalBoard, CompetitiveExam } from './CurriculumAdapter';

describe('CurriculumAdapter', () => {
  let adapter: CurriculumAdapter;

  beforeEach(() => {
    adapter = new CurriculumAdapter();
  });

  describe('getSubjects', () => {
    it('should return subjects for CBSE Grade 10', () => {
      const subjects = adapter.getSubjects('CBSE', 10);
      
      expect(subjects).toBeDefined();
      expect(subjects.length).toBeGreaterThan(0);
      expect(subjects[0].board).toBe('CBSE');
      expect(subjects[0].grade).toBe(10);
    });

    it('should return subjects for CBSE Grade 12', () => {
      const subjects = adapter.getSubjects('CBSE', 12);
      
      expect(subjects).toBeDefined();
      expect(subjects.length).toBeGreaterThan(0);
      expect(subjects.some(s => s.name === 'Mathematics')).toBe(true);
      expect(subjects.some(s => s.name === 'Physics')).toBe(true);
    });

    it('should return subjects for ICSE Grade 10', () => {
      const subjects = adapter.getSubjects('ICSE', 10);
      
      expect(subjects).toBeDefined();
      expect(subjects.length).toBeGreaterThan(0);
      expect(subjects[0].board).toBe('ICSE');
    });

    it('should return empty array for unsupported board/grade combination', () => {
      const subjects = adapter.getSubjects('Maharashtra', 8);
      
      expect(subjects).toEqual([]);
    });

    it('should include exam relevance for subjects', () => {
      const subjects = adapter.getSubjects('CBSE', 12);
      const mathSubject = subjects.find(s => s.name === 'Mathematics');
      
      expect(mathSubject).toBeDefined();
      expect(mathSubject!.examRelevance).toContain('JEE Main');
      expect(mathSubject!.examRelevance).toContain('JEE Advanced');
    });
  });

  describe('alignContent', () => {
    it('should align content with CBSE board', async () => {
      const content = {
        title: 'Quadratic Equations',
        topics: ['Quadratic Equations', 'Factorization']
      };
      
      const aligned = await adapter.alignContent(content, 'CBSE');
      
      expect(aligned).toBeDefined();
      expect(aligned.board).toBe('CBSE');
      expect(aligned.topics).toContain('Quadratic Equations');
      expect(aligned.alignmentScore).toBeGreaterThan(0);
    });

    it('should calculate alignment score correctly', async () => {
      const content = {
        topics: ['Real Numbers', 'Polynomials', 'Linear Equations']
      };
      
      const aligned = await adapter.alignContent(content, 'CBSE');
      
      expect(aligned.alignmentScore).toBeGreaterThan(0);
      expect(aligned.alignmentScore).toBeLessThanOrEqual(1);
    });

    it('should identify exam relevance from content', async () => {
      const content = {
        topics: ['Trigonometry', 'Calculus']
      };
      
      const aligned = await adapter.alignContent(content, 'CBSE');
      
      expect(aligned.examRelevance).toBeDefined();
      expect(aligned.examRelevance.length).toBeGreaterThan(0);
    });

    it('should handle string content', async () => {
      const content = 'Quadratic Equations';
      
      const aligned = await adapter.alignContent(content, 'CBSE');
      
      expect(aligned).toBeDefined();
      expect(aligned.topics).toContain('Quadratic Equations');
    });

    it('should assign appropriate difficulty level', async () => {
      const content = {
        topics: ['Algebra']
      };
      
      const aligned = await adapter.alignContent(content, 'CBSE');
      
      expect(['Easy', 'Medium', 'Hard']).toContain(aligned.difficulty);
    });
  });

  describe('generateSyllabus', () => {
    it('should generate syllabus for CBSE Grade 10 Mathematics', async () => {
      const syllabus = await adapter.generateSyllabus('CBSE', 10, 'Mathematics');
      
      expect(syllabus).toBeDefined();
      expect(syllabus.board).toBe('CBSE');
      expect(syllabus.grade).toBe(10);
      expect(syllabus.subject).toBe('Mathematics');
      expect(syllabus.units.length).toBeGreaterThan(0);
    });

    it('should include exam pattern in syllabus', async () => {
      const syllabus = await adapter.generateSyllabus('CBSE', 10, 'Mathematics');
      
      expect(syllabus.examPattern).toBeDefined();
      expect(syllabus.examPattern.totalMarks).toBeGreaterThan(0);
      expect(syllabus.examPattern.duration).toBeGreaterThan(0);
      expect(syllabus.examPattern.sections.length).toBeGreaterThan(0);
    });

    it('should include units with weightage', async () => {
      const syllabus = await adapter.generateSyllabus('CBSE', 10, 'Mathematics');
      
      const totalWeightage = syllabus.units.reduce((sum, unit) => sum + unit.weightage, 0);
      expect(totalWeightage).toBeGreaterThan(0);
      expect(totalWeightage).toBeLessThanOrEqual(100);
    });

    it('should return default syllabus for unsupported combination', async () => {
      const syllabus = await adapter.generateSyllabus('Maharashtra', 8, 'Science');
      
      expect(syllabus).toBeDefined();
      expect(syllabus.board).toBe('Maharashtra');
      expect(syllabus.grade).toBe(8);
      expect(syllabus.subject).toBe('Science');
    });
  });

  describe('mapCompetitiveExam', () => {
    it('should map JEE Main exam details', async () => {
      const mapping = await adapter.mapCompetitiveExam('JEE Main');
      
      expect(mapping).toBeDefined();
      expect(mapping.exam).toBe('JEE Main');
      expect(mapping.subjects).toContain('Physics');
      expect(mapping.subjects).toContain('Chemistry');
      expect(mapping.subjects).toContain('Mathematics');
    });

    it('should include exam pattern for JEE Main', async () => {
      const mapping = await adapter.mapCompetitiveExam('JEE Main');
      
      expect(mapping.pattern).toBeDefined();
      expect(mapping.pattern.totalMarks).toBe(300);
      expect(mapping.pattern.duration).toBe(180);
      expect(mapping.pattern.sections.length).toBe(3);
    });

    it('should map NEET exam details', async () => {
      const mapping = await adapter.mapCompetitiveExam('NEET');
      
      expect(mapping).toBeDefined();
      expect(mapping.exam).toBe('NEET');
      expect(mapping.subjects).toContain('Biology');
    });

    it('should include preparation tips', async () => {
      const mapping = await adapter.mapCompetitiveExam('JEE Main');
      
      expect(mapping.preparationTips).toBeDefined();
      expect(mapping.preparationTips.length).toBeGreaterThan(0);
    });

    it('should include recommended resources', async () => {
      const mapping = await adapter.mapCompetitiveExam('NEET');
      
      expect(mapping.recommendedResources).toBeDefined();
      expect(mapping.recommendedResources.length).toBeGreaterThan(0);
    });

    it('should map UPSC exam details', async () => {
      const mapping = await adapter.mapCompetitiveExam('UPSC');
      
      expect(mapping).toBeDefined();
      expect(mapping.exam).toBe('UPSC');
      expect(mapping.pattern.totalMarks).toBeGreaterThan(1000);
    });

    it('should return default mapping for unsupported exam', async () => {
      const mapping = await adapter.mapCompetitiveExam('CAT');
      
      expect(mapping).toBeDefined();
      expect(mapping.exam).toBe('CAT');
    });
  });

  describe('getStudyPlan', () => {
    it('should generate study plan for CBSE Grade 10 with JEE Main', () => {
      const plan = adapter.getStudyPlan('CBSE', 10, 'JEE Main');
      
      expect(plan).toBeDefined();
      expect(plan.board).toBe('CBSE');
      expect(plan.grade).toBe(10);
      expect(plan.targetExam).toBe('JEE Main');
    });

    it('should include weekly schedule', () => {
      const plan = adapter.getStudyPlan('CBSE', 12, 'JEE Main');
      
      expect(plan.weeklySchedule).toBeDefined();
      expect(plan.weeklySchedule.monday).toBeDefined();
      expect(plan.weeklySchedule.tuesday).toBeDefined();
      expect(plan.weeklySchedule.sunday).toBeDefined();
    });

    it('should include milestones', () => {
      const plan = adapter.getStudyPlan('CBSE', 12, 'NEET');
      
      expect(plan.milestones).toBeDefined();
      expect(plan.milestones.length).toBeGreaterThan(0);
      expect(plan.milestones[0].name).toBeDefined();
      expect(plan.milestones[0].deadline).toBeInstanceOf(Date);
    });

    it('should include subjects from board', () => {
      const plan = adapter.getStudyPlan('CBSE', 10, 'JEE Main');
      
      expect(plan.subjects).toBeDefined();
      expect(plan.subjects.length).toBeGreaterThan(0);
    });

    it('should include recommended resources', () => {
      const plan = adapter.getStudyPlan('CBSE', 12, 'JEE Main');
      
      expect(plan.resources).toBeDefined();
    });
  });

  describe('Subject Data Integrity', () => {
    it('should have valid subject codes', () => {
      const subjects = adapter.getSubjects('CBSE', 10);
      
      subjects.forEach(subject => {
        expect(subject.code).toBeDefined();
        expect(subject.code.length).toBeGreaterThan(0);
      });
    });

    it('should have topics for each subject', () => {
      const subjects = adapter.getSubjects('CBSE', 12);
      
      subjects.forEach(subject => {
        expect(subject.topics).toBeDefined();
        expect(subject.topics.length).toBeGreaterThan(0);
      });
    });

    it('should have valid difficulty levels', () => {
      const subjects = adapter.getSubjects('CBSE', 10);
      
      subjects.forEach(subject => {
        expect(['Easy', 'Medium', 'Hard']).toContain(subject.difficulty);
      });
    });
  });

  describe('Cross-Board Compatibility', () => {
    it('should support multiple boards', () => {
      const cbseSubjects = adapter.getSubjects('CBSE', 10);
      const icseSubjects = adapter.getSubjects('ICSE', 10);
      
      expect(cbseSubjects.length).toBeGreaterThan(0);
      expect(icseSubjects.length).toBeGreaterThan(0);
      expect(cbseSubjects[0].board).toBe('CBSE');
      expect(icseSubjects[0].board).toBe('ICSE');
    });

    it('should align content across different boards', async () => {
      const content = { topics: ['Algebra'] };
      
      const cbseAligned = await adapter.alignContent(content, 'CBSE');
      const icseAligned = await adapter.alignContent(content, 'ICSE');
      
      expect(cbseAligned.board).toBe('CBSE');
      expect(icseAligned.board).toBe('ICSE');
    });
  });

  describe('Exam Pattern Validation', () => {
    it('should have valid question types in exam patterns', async () => {
      const syllabus = await adapter.generateSyllabus('CBSE', 10, 'Mathematics');
      
      syllabus.examPattern.sections.forEach(section => {
        section.questionTypes.forEach(qt => {
          expect(['MCQ', 'Short Answer', 'Long Answer', 'Numerical', 'True/False', 'Essay']).toContain(qt.type);
          expect(qt.count).toBeGreaterThan(0);
          expect(qt.marksPerQuestion).toBeGreaterThan(0);
        });
      });
    });

    it('should have consistent marks calculation', async () => {
      const mapping = await adapter.mapCompetitiveExam('JEE Main');
      
      const totalMarks = mapping.pattern.sections.reduce((sum, section) => sum + section.marks, 0);
      expect(totalMarks).toBe(mapping.pattern.totalMarks);
    });
  });
});
