import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { 
  useCurriculum, 
  useSyllabus, 
  useCompetitiveExam, 
  useStudyPlan,
  useSubjectsByExam,
  useCurriculumProgress
} from './useCurriculum';

describe('useCurriculum', () => {
  it('should fetch subjects for CBSE Grade 10', async () => {
    const { result } = renderHook(() => useCurriculum('CBSE', 10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.subjects).toBeDefined();
    expect(result.current.subjects.length).toBeGreaterThan(0);
  });

  it('should update when board or grade changes', async () => {
    const { result, rerender } = renderHook(
      ({ board, grade }) => useCurriculum(board, grade),
      { initialProps: { board: 'CBSE' as const, grade: 10 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialSubjects = result.current.subjects;

    rerender({ board: 'CBSE' as const, grade: 12 });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.subjects).not.toEqual(initialSubjects);
  });
});

describe('useSyllabus', () => {
  it('should fetch syllabus for CBSE Grade 10 Mathematics', async () => {
    const { result } = renderHook(() => useSyllabus('CBSE', 10, 'Mathematics'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.syllabus).toBeDefined();
    expect(result.current.syllabus?.board).toBe('CBSE');
    expect(result.current.syllabus?.grade).toBe(10);
    expect(result.current.syllabus?.subject).toBe('Mathematics');
  });

  it('should handle subject changes', async () => {
    const { result, rerender } = renderHook(
      ({ subject }) => useSyllabus('CBSE', 10, subject),
      { initialProps: { subject: 'Mathematics' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    rerender({ subject: 'Science' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.syllabus?.subject).toBe('Science');
  });
});

describe('useCompetitiveExam', () => {
  it('should fetch JEE Main exam mapping', async () => {
    const { result } = renderHook(() => useCompetitiveExam('JEE Main'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.examMapping).toBeDefined();
    expect(result.current.examMapping?.exam).toBe('JEE Main');
    expect(result.current.examMapping?.subjects).toContain('Physics');
  });

  it('should fetch NEET exam mapping', async () => {
    const { result } = renderHook(() => useCompetitiveExam('NEET'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.examMapping).toBeDefined();
    expect(result.current.examMapping?.exam).toBe('NEET');
    expect(result.current.examMapping?.subjects).toContain('Biology');
  });
});

describe('useStudyPlan', () => {
  it('should generate study plan for CBSE Grade 10 with JEE Main', () => {
    const { result } = renderHook(() => useStudyPlan('CBSE', 10, 'JEE Main'));

    expect(result.current.studyPlan).toBeDefined();
    expect(result.current.studyPlan.board).toBe('CBSE');
    expect(result.current.studyPlan.grade).toBe(10);
    expect(result.current.studyPlan.targetExam).toBe('JEE Main');
  });

  it('should include weekly schedule', () => {
    const { result } = renderHook(() => useStudyPlan('CBSE', 12, 'NEET'));

    expect(result.current.studyPlan.weeklySchedule).toBeDefined();
    expect(result.current.studyPlan.weeklySchedule.monday).toBeDefined();
  });

  it('should memoize study plan', () => {
    const { result, rerender } = renderHook(() => useStudyPlan('CBSE', 10, 'JEE Main'));

    const firstPlan = result.current.studyPlan;
    rerender();
    const secondPlan = result.current.studyPlan;

    expect(firstPlan).toBe(secondPlan);
  });
});

describe('useSubjectsByExam', () => {
  it('should filter subjects by JEE Main relevance', async () => {
    const { result } = renderHook(() => useSubjectsByExam('CBSE', 12, 'JEE Main'));

    await waitFor(() => {
      expect(result.current.subjects.length).toBeGreaterThan(0);
    });

    result.current.subjects.forEach(subject => {
      expect(subject.examRelevance).toContain('JEE Main');
    });
  });

  it('should filter subjects by NEET relevance', async () => {
    const { result } = renderHook(() => useSubjectsByExam('CBSE', 12, 'NEET'));

    await waitFor(() => {
      expect(result.current.subjects.length).toBeGreaterThan(0);
    });

    result.current.subjects.forEach(subject => {
      expect(subject.examRelevance).toContain('NEET');
    });
  });
});

describe('useCurriculumProgress', () => {
  it('should calculate progress correctly', async () => {
    const completedTopics = ['Real Numbers', 'Polynomials'];
    const { result } = renderHook(() => useCurriculumProgress('CBSE', 10, completedTopics));

    await waitFor(() => {
      expect(result.current.totalTopics).toBeGreaterThan(0);
    });

    expect(result.current.completedTopics).toBe(2);
    expect(result.current.percentage).toBeGreaterThanOrEqual(0);
    expect(result.current.percentage).toBeLessThanOrEqual(100);
    expect(result.current.remainingTopics).toBeGreaterThan(0);
  });

  it('should update when completed topics change', async () => {
    const { result, rerender } = renderHook(
      ({ completed }) => useCurriculumProgress('CBSE', 10, completed),
      { initialProps: { completed: ['Real Numbers'] } }
    );

    await waitFor(() => {
      expect(result.current.totalTopics).toBeGreaterThan(0);
    });

    const initialPercentage = result.current.percentage;

    rerender({ completed: ['Real Numbers', 'Polynomials', 'Linear Equations'] });

    await waitFor(() => {
      expect(result.current.percentage).toBeGreaterThan(initialPercentage);
    });
  });

  it('should handle empty completed topics', async () => {
    const { result } = renderHook(() => useCurriculumProgress('CBSE', 10, []));

    await waitFor(() => {
      expect(result.current.totalTopics).toBeGreaterThan(0);
    });

    expect(result.current.completedTopics).toBe(0);
    expect(result.current.percentage).toBe(0);
  });
});
