import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, CourseModule, UserProfile, SkillAssessment } from '../src/services/CourseGeneratorService';
import { Note } from '../src/services/NotebookLMService';

interface CourseProgress {
  courseId: string;
  completedModules: string[];
  quizScores: Record<string, number>;
  assignmentScores: Record<string, number>;
  lastAccessed: Date;
  timeSpent: number; // minutes
}

interface CourseState {
  // User Profile
  userProfile: UserProfile | null;
  skillAssessments: SkillAssessment[];
  setUserProfile: (profile: UserProfile) => void;
  addSkillAssessment: (assessment: SkillAssessment) => void;

  // Courses
  courses: Course[];
  enrolledCourses: string[];
  courseProgress: Record<string, CourseProgress>;
  activeCourseId: string | null;
  activeModuleId: string | null;

  addCourse: (course: Course) => void;
  enrollInCourse: (courseId: string) => void;
  unenrollFromCourse: (courseId: string) => void;
  setActiveCourse: (courseId: string) => void;
  setActiveModule: (moduleId: string) => void;
  updateCourseProgress: (courseId: string, moduleId: string) => void;
  recordQuizScore: (courseId: string, quizId: string, score: number) => void;
  recordAssignmentScore: (courseId: string, assignmentId: string, score: number) => void;
  updateModule: (courseId: string, moduleId: string, updates: Partial<CourseModule>) => void;
  deleteModule: (courseId: string, moduleId: string) => void;
  reorderModules: (courseId: string, moduleIds: string[]) => void;

  // Notes (NotebookLM)
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  searchNotes: (query: string) => Note[];

  // Quick Assessment
  showQuickAssessment: boolean;
  setShowQuickAssessment: (show: boolean) => void;
}

// Sample courses for demonstration
const SAMPLE_COURSES: Course[] = [
  {
    id: 'course-sample-1',
    title: 'Introduction to Python Programming',
    description: 'Learn Python from scratch with hands-on projects and real-world examples',
    instructor: 'AI-Curated',
    thumbnail: 'https://img.youtube.com/vi/kqtD5dpn9C8/maxresdefault.jpg',
    modules: [
      {
        id: 'module-1',
        title: 'Python Basics',
        description: 'Learn Python syntax, variables, and data types',
        duration: 45,
        videos: [{
          id: 'video-1',
          title: 'Python Tutorial for Beginners',
          youtubeId: 'kqtD5dpn9C8',
          duration: 45,
          description: 'Complete Python tutorial for beginners',
          suggestedSearch: 'python programming basics tutorial'
        }],
        order: 1
      },
      {
        id: 'module-2',
        title: 'Control Flow',
        description: 'Master if statements, loops, and functions',
        duration: 50,
        videos: [{
          id: 'video-2',
          title: 'Python Control Flow',
          youtubeId: '_uQrJ0TkZlc',
          duration: 50,
          description: 'Learn control flow in Python',
          suggestedSearch: 'python control flow loops'
        }],
        order: 2
      }
    ],
    totalDuration: 95,
    difficulty: 'beginner',
    tags: ['Programming', 'Python', 'Beginner'],
    progress: 0,
    enrolled: false,
    createdAt: new Date()
  },
  {
    id: 'course-sample-2',
    title: 'Web Development Fundamentals',
    description: 'Master HTML, CSS, and JavaScript to build modern websites',
    instructor: 'AI-Curated',
    thumbnail: 'https://img.youtube.com/vi/UB1O30fR-EE/maxresdefault.jpg',
    modules: [
      {
        id: 'module-3',
        title: 'HTML Basics',
        description: 'Learn HTML structure and elements',
        duration: 40,
        videos: [{
          id: 'video-3',
          title: 'HTML Tutorial for Beginners',
          youtubeId: 'UB1O30fR-EE',
          duration: 40,
          description: 'Complete HTML tutorial',
          suggestedSearch: 'html tutorial beginners'
        }],
        order: 1
      },
      {
        id: 'module-4',
        title: 'CSS Styling',
        description: 'Style your websites with CSS',
        duration: 45,
        videos: [{
          id: 'video-4',
          title: 'CSS Tutorial',
          youtubeId: 'yfoY53QXEnI',
          duration: 45,
          description: 'Learn CSS styling',
          suggestedSearch: 'css tutorial styling'
        }],
        order: 2
      }
    ],
    totalDuration: 85,
    difficulty: 'beginner',
    tags: ['Web Development', 'HTML', 'CSS'],
    progress: 0,
    enrolled: false,
    createdAt: new Date()
  },
  {
    id: 'course-sample-3',
    title: 'Data Science with Python',
    description: 'Learn data analysis, visualization, and machine learning basics',
    instructor: 'AI-Curated',
    thumbnail: 'https://img.youtube.com/vi/LHBE6Q9XlzI/maxresdefault.jpg',
    modules: [
      {
        id: 'module-5',
        title: 'Data Analysis Basics',
        description: 'Introduction to data analysis with pandas',
        duration: 60,
        videos: [{
          id: 'video-5',
          title: 'Data Science Tutorial',
          youtubeId: 'LHBE6Q9XlzI',
          duration: 60,
          description: 'Learn data science fundamentals',
          suggestedSearch: 'data science python tutorial'
        }],
        order: 1
      }
    ],
    totalDuration: 60,
    difficulty: 'intermediate',
    tags: ['Data Science', 'Python', 'Machine Learning'],
    progress: 0,
    enrolled: false,
    createdAt: new Date()
  }
];

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      // Initial State
      userProfile: null,
      skillAssessments: [],
      courses: SAMPLE_COURSES,
      enrolledCourses: [],
      courseProgress: {},
      activeCourseId: null,
      activeModuleId: null,
      notes: [],
      showQuickAssessment: false,

      // User Profile Actions
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      addSkillAssessment: (assessment) => set((state) => ({
        skillAssessments: [...state.skillAssessments, assessment]
      })),

      // Course Actions
      addCourse: (course) => set((state) => ({
        courses: [...state.courses, course]
      })),

      enrollInCourse: (courseId) => set((state) => {
        const course = state.courses.find(c => c.id === courseId);
        if (!course) return state;

        return {
          enrolledCourses: [...state.enrolledCourses, courseId],
          courseProgress: {
            ...state.courseProgress,
            [courseId]: {
              courseId,
              completedModules: [],
              quizScores: {},
              assignmentScores: {},
              lastAccessed: new Date(),
              timeSpent: 0
            }
          },
          courses: state.courses.map(c =>
            c.id === courseId ? { ...c, enrolled: true } : c
          )
        };
      }),

      unenrollFromCourse: (courseId) => set((state) => ({
        enrolledCourses: state.enrolledCourses.filter(id => id !== courseId),
        courses: state.courses.map(c =>
          c.id === courseId ? { ...c, enrolled: false } : c
        )
      })),

      setActiveCourse: (courseId) => set({ activeCourseId: courseId }),
      
      setActiveModule: (moduleId) => set({ activeModuleId: moduleId }),

      updateCourseProgress: (courseId, moduleId) => set((state) => {
        const progress = state.courseProgress[courseId];
        if (!progress) return state;

        const completedModules = progress.completedModules.includes(moduleId)
          ? progress.completedModules
          : [...progress.completedModules, moduleId];

        const course = state.courses.find(c => c.id === courseId);
        const progressPercent = course
          ? (completedModules.length / course.modules.length) * 100
          : 0;

        return {
          courseProgress: {
            ...state.courseProgress,
            [courseId]: {
              ...progress,
              completedModules,
              lastAccessed: new Date()
            }
          },
          courses: state.courses.map(c =>
            c.id === courseId ? { ...c, progress: progressPercent } : c
          )
        };
      }),

      recordQuizScore: (courseId, quizId, score) => set((state) => {
        const progress = state.courseProgress[courseId];
        if (!progress) return state;

        return {
          courseProgress: {
            ...state.courseProgress,
            [courseId]: {
              ...progress,
              quizScores: {
                ...progress.quizScores,
                [quizId]: score
              }
            }
          }
        };
      }),

      recordAssignmentScore: (courseId, assignmentId, score) => set((state) => {
        const progress = state.courseProgress[courseId];
        if (!progress) return state;

        return {
          courseProgress: {
            ...state.courseProgress,
            [courseId]: {
              ...progress,
              assignmentScores: {
                ...progress.assignmentScores,
                [assignmentId]: score
              }
            }
          }
        };
      }),

      updateModule: (courseId, moduleId, updates) => set((state) => ({
        courses: state.courses.map(course =>
          course.id === courseId
            ? {
                ...course,
                modules: course.modules.map(module =>
                  module.id === moduleId ? { ...module, ...updates } : module
                )
              }
            : course
        )
      })),

      deleteModule: (courseId, moduleId) => set((state) => ({
        courses: state.courses.map(course =>
          course.id === courseId
            ? {
                ...course,
                modules: course.modules.filter(m => m.id !== moduleId)
              }
            : course
        )
      })),

      reorderModules: (courseId, moduleIds) => set((state) => ({
        courses: state.courses.map(course =>
          course.id === courseId
            ? {
                ...course,
                modules: moduleIds
                  .map(id => course.modules.find(m => m.id === id))
                  .filter(Boolean) as CourseModule[]
              }
            : course
        )
      })),

      // Notes Actions
      addNote: (noteData) => set((state) => ({
        notes: [
          ...state.notes,
          {
            ...noteData,
            id: `note-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      })),

      updateNote: (noteId, updates) => set((state) => ({
        notes: state.notes.map(note =>
          note.id === noteId
            ? { ...note, ...updates, updatedAt: new Date() }
            : note
        )
      })),

      deleteNote: (noteId) => set((state) => ({
        notes: state.notes.filter(note => note.id !== noteId)
      })),

      searchNotes: (query) => {
        const state = get();
        const lowerQuery = query.toLowerCase();
        return state.notes.filter(note =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery) ||
          note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      },

      // Quick Assessment
      setShowQuickAssessment: (show) => set({ showQuickAssessment: show })
    }),
    {
      name: 'course-storage',
      version: 1
    }
  )
);
