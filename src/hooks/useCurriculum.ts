import { useState, useEffect, useMemo } from 'react';
import { 
  curriculumAdapter, 
  EducationalBoard, 
  CompetitiveExam, 
  Subject, 
  Syllabus, 
  ExamMapping, 
  StudyPlan 
} from '@/src/services/CurriculumAdapter';

/**
 * Hook for accessing curriculum data
 */
export function useCurriculum(board: EducationalBoard, grade: number) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchedSubjects = curriculumAdapter.getSubjects(board, grade);
    setSubjects(fetchedSubjects);
    setLoading(false);
  }, [board, grade]);

  return { subjects, loading };
}

/**
 * Hook for accessing syllabus data
 */
export function useSyllabus(board: EducationalBoard, grade: number, subject: string) {
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    curriculumAdapter.generateSyllabus(board, grade, subject).then(result => {
      if (mounted) {
        setSyllabus(result);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [board, grade, subject]);

  return { syllabus, loading };
}

/**
 * Hook for accessing competitive exam data
 */
export function useCompetitiveExam(exam: CompetitiveExam) {
  const [examMapping, setExamMapping] = useState<ExamMapping | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    curriculumAdapter.mapCompetitiveExam(exam).then(result => {
      if (mounted) {
        setExamMapping(result);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [exam]);

  return { examMapping, loading };
}

/**
 * Hook for generating study plans
 */
export function useStudyPlan(board: EducationalBoard, grade: number, exam: CompetitiveExam) {
  const studyPlan = useMemo(() => {
    return curriculumAdapter.getStudyPlan(board, grade, exam);
  }, [board, grade, exam]);

  return { studyPlan };
}

/**
 * Hook for content alignment
 */
export function useContentAlignment(content: any, board: EducationalBoard) {
  const [alignedContent, setAlignedContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    curriculumAdapter.alignContent(content, board).then(result => {
      if (mounted) {
        setAlignedContent(result);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [content, board]);

  return { alignedContent, loading };
}

/**
 * Hook for getting subjects by exam relevance
 */
export function useSubjectsByExam(board: EducationalBoard, grade: number, exam: CompetitiveExam) {
  const { subjects } = useCurriculum(board, grade);

  const relevantSubjects = useMemo(() => {
    return subjects.filter(subject => subject.examRelevance.includes(exam));
  }, [subjects, exam]);

  return { subjects: relevantSubjects };
}

/**
 * Hook for tracking curriculum progress
 */
export function useCurriculumProgress(board: EducationalBoard, grade: number, completedTopics: string[]) {
  const { subjects } = useCurriculum(board, grade);

  const progress = useMemo(() => {
    const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
    const completed = completedTopics.length;
    const percentage = totalTopics > 0 ? (completed / totalTopics) * 100 : 0;

    return {
      totalTopics,
      completedTopics: completed,
      percentage: Math.round(percentage),
      remainingTopics: totalTopics - completed
    };
  }, [subjects, completedTopics]);

  return progress;
}
