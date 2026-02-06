/**
 * Educational Board types supported in India
 */
export type EducationalBoard = 'CBSE' | 'ICSE' | 'Maharashtra' | 'Tamil Nadu' | 'Karnataka' | 'State Board';

/**
 * Competitive Exam types
 */
export type CompetitiveExam = 'JEE Main' | 'JEE Advanced' | 'NEET' | 'UPSC' | 'CAT' | 'GATE' | 'None';

/**
 * Subject information
 */
export interface Subject {
  id: string;
  name: string;
  code: string;
  board: EducationalBoard;
  grade: number;
  topics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  examRelevance: CompetitiveExam[];
}

/**
 * Syllabus structure
 */
export interface Syllabus {
  board: EducationalBoard;
  grade: number;
  subject: string;
  units: SyllabusUnit[];
  totalMarks: number;
  examPattern: ExamPattern;
}

export interface SyllabusUnit {
  id: string;
  name: string;
  topics: string[];
  weightage: number; // Percentage
  estimatedHours: number;
}

export interface ExamPattern {
  totalMarks: number;
  duration: number; // in minutes
  sections: ExamSection[];
  passingMarks: number;
}

export interface ExamSection {
  name: string;
  marks: number;
  questionTypes: QuestionType[];
}

export interface QuestionType {
  type: 'MCQ' | 'Short Answer' | 'Long Answer' | 'Numerical' | 'True/False' | 'Essay';
  count: number;
  marksPerQuestion: number;
}

/**
 * Aligned Content structure
 */
export interface AlignedContent {
  originalContent: any;
  board: EducationalBoard;
  grade: number;
  subject: string;
  topics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  examRelevance: CompetitiveExam[];
  alignmentScore: number; // 0-1
}

/**
 * Exam Mapping for competitive exams
 */
export interface ExamMapping {
  exam: CompetitiveExam;
  subjects: string[];
  syllabus: string[];
  pattern: ExamPattern;
  preparationTips: string[];
  recommendedResources: string[];
}

/**
 * Curriculum Adapter Service
 * Aligns content with Indian educational boards and competitive exams
 */
export class CurriculumAdapter {
  private boardSubjects: Map<string, Subject[]>;
  private syllabusDatabase: Map<string, Syllabus>;
  private examMappings: Map<CompetitiveExam, ExamMapping>;

  constructor() {
    this.boardSubjects = new Map();
    this.syllabusDatabase = new Map();
    this.examMappings = new Map();
    this.initializeBoardSubjects();
    this.initializeSyllabus();
    this.initializeExamMappings();
  }

  /**
   * Get subjects for a specific board and grade
   */
  getSubjects(board: EducationalBoard, grade: number): Subject[] {
    const key = `${board}-${grade}`;
    return this.boardSubjects.get(key) || [];
  }

  /**
   * Align content with educational board
   */
  async alignContent(content: any, board: EducationalBoard): Promise<AlignedContent> {
    // Extract topics from content
    const topics = this.extractTopics(content);
    
    // Find matching subjects
    const matchingSubjects = this.findMatchingSubjects(topics, board);
    
    // Calculate alignment score
    const alignmentScore = this.calculateAlignmentScore(topics, matchingSubjects);
    
    // Determine difficulty
    const difficulty = this.determineDifficulty(content, board);
    
    // Find exam relevance
    const examRelevance = this.findExamRelevance(topics);
    
    return {
      originalContent: content,
      board,
      grade: matchingSubjects[0]?.grade || 10,
      subject: matchingSubjects[0]?.name || 'General',
      topics,
      difficulty,
      examRelevance,
      alignmentScore
    };
  }

  /**
   * Generate syllabus for board, grade, and subject
   */
  async generateSyllabus(board: EducationalBoard, grade: number, subject: string): Promise<Syllabus> {
    const key = `${board}-${grade}-${subject}`;
    return this.syllabusDatabase.get(key) || this.createDefaultSyllabus(board, grade, subject);
  }

  /**
   * Map competitive exam details
   */
  async mapCompetitiveExam(exam: CompetitiveExam): Promise<ExamMapping> {
    return this.examMappings.get(exam) || this.createDefaultExamMapping(exam);
  }

  /**
   * Get recommended study plan for board and exam
   */
  getStudyPlan(board: EducationalBoard, grade: number, exam: CompetitiveExam): StudyPlan {
    const subjects = this.getSubjects(board, grade);
    const examMapping = this.examMappings.get(exam);
    
    return {
      board,
      grade,
      targetExam: exam,
      subjects: subjects.map(s => s.name),
      weeklySchedule: this.generateWeeklySchedule(subjects, exam),
      milestones: this.generateMilestones(grade, exam),
      resources: examMapping?.recommendedResources || []
    };
  }

  // Private helper methods

  private initializeBoardSubjects(): void {
    // CBSE Grade 10 subjects
    this.boardSubjects.set('CBSE-10', [
      {
        id: 'cbse-10-math',
        name: 'Mathematics',
        code: 'MATH-041',
        board: 'CBSE',
        grade: 10,
        topics: ['Real Numbers', 'Polynomials', 'Linear Equations', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Trigonometry', 'Circles', 'Areas Related to Circles', 'Surface Areas and Volumes', 'Statistics', 'Probability'],
        difficulty: 'Medium',
        examRelevance: ['JEE Main', 'JEE Advanced']
      },
      {
        id: 'cbse-10-science',
        name: 'Science',
        code: 'SCI-086',
        board: 'CBSE',
        grade: 10,
        topics: ['Chemical Reactions', 'Acids Bases and Salts', 'Metals and Non-metals', 'Carbon Compounds', 'Periodic Classification', 'Life Processes', 'Control and Coordination', 'Reproduction', 'Heredity and Evolution', 'Light', 'Human Eye', 'Electricity', 'Magnetic Effects', 'Energy Sources'],
        difficulty: 'Medium',
        examRelevance: ['NEET', 'JEE Main']
      },
      {
        id: 'cbse-10-social',
        name: 'Social Science',
        code: 'SST-087',
        board: 'CBSE',
        grade: 10,
        topics: ['Nationalism in Europe', 'Nationalism in India', 'Making of Global World', 'Age of Industrialization', 'Print Culture', 'Resources and Development', 'Forest and Wildlife', 'Water Resources', 'Agriculture', 'Minerals and Energy', 'Manufacturing Industries', 'Lifelines of National Economy', 'Power Sharing', 'Federalism', 'Democracy and Diversity', 'Gender Religion and Caste', 'Political Parties', 'Outcomes of Democracy', 'Development', 'Sectors of Indian Economy', 'Money and Credit', 'Globalization'],
        difficulty: 'Easy',
        examRelevance: ['UPSC']
      }
    ]);

    // CBSE Grade 12 subjects (for JEE/NEET)
    this.boardSubjects.set('CBSE-12', [
      {
        id: 'cbse-12-math',
        name: 'Mathematics',
        code: 'MATH-041',
        board: 'CBSE',
        grade: 12,
        topics: ['Relations and Functions', 'Inverse Trigonometric Functions', 'Matrices', 'Determinants', 'Continuity and Differentiability', 'Applications of Derivatives', 'Integrals', 'Applications of Integrals', 'Differential Equations', 'Vector Algebra', '3D Geometry', 'Linear Programming', 'Probability'],
        difficulty: 'Hard',
        examRelevance: ['JEE Main', 'JEE Advanced']
      },
      {
        id: 'cbse-12-physics',
        name: 'Physics',
        code: 'PHY-042',
        board: 'CBSE',
        grade: 12,
        topics: ['Electric Charges and Fields', 'Electrostatic Potential', 'Current Electricity', 'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 'Ray Optics', 'Wave Optics', 'Dual Nature of Radiation', 'Atoms', 'Nuclei', 'Semiconductor Electronics', 'Communication Systems'],
        difficulty: 'Hard',
        examRelevance: ['JEE Main', 'JEE Advanced', 'NEET']
      },
      {
        id: 'cbse-12-chemistry',
        name: 'Chemistry',
        code: 'CHEM-043',
        board: 'CBSE',
        grade: 12,
        topics: ['Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'General Principles of Metallurgy', 'p-Block Elements', 'd and f Block Elements', 'Coordination Compounds', 'Haloalkanes and Haloarenes', 'Alcohols Phenols and Ethers', 'Aldehydes Ketones and Carboxylic Acids', 'Amines', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'],
        difficulty: 'Hard',
        examRelevance: ['JEE Main', 'JEE Advanced', 'NEET']
      },
      {
        id: 'cbse-12-biology',
        name: 'Biology',
        code: 'BIO-044',
        board: 'CBSE',
        grade: 12,
        topics: ['Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants', 'Human Reproduction', 'Reproductive Health', 'Principles of Inheritance', 'Molecular Basis of Inheritance', 'Evolution', 'Human Health and Disease', 'Strategies for Food Production', 'Microbes in Human Welfare', 'Biotechnology Principles', 'Biotechnology Applications', 'Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation', 'Environmental Issues'],
        difficulty: 'Hard',
        examRelevance: ['NEET']
      }
    ]);

    // ICSE Grade 10 subjects
    this.boardSubjects.set('ICSE-10', [
      {
        id: 'icse-10-math',
        name: 'Mathematics',
        code: 'MATH',
        board: 'ICSE',
        grade: 10,
        topics: ['Commercial Mathematics', 'Algebra', 'Geometry', 'Mensuration', 'Trigonometry', 'Statistics', 'Probability'],
        difficulty: 'Medium',
        examRelevance: ['JEE Main']
      },
      {
        id: 'icse-10-science',
        name: 'Science',
        code: 'SCI',
        board: 'ICSE',
        grade: 10,
        topics: ['Physics', 'Chemistry', 'Biology'],
        difficulty: 'Medium',
        examRelevance: ['NEET', 'JEE Main']
      }
    ]);
  }

  private initializeSyllabus(): void {
    // CBSE Grade 10 Mathematics Syllabus
    this.syllabusDatabase.set('CBSE-10-Mathematics', {
      board: 'CBSE',
      grade: 10,
      subject: 'Mathematics',
      units: [
        {
          id: 'unit-1',
          name: 'Number Systems',
          topics: ['Real Numbers', 'Euclid\'s Division Algorithm', 'Fundamental Theorem of Arithmetic', 'Irrational Numbers'],
          weightage: 6,
          estimatedHours: 15
        },
        {
          id: 'unit-2',
          name: 'Algebra',
          topics: ['Polynomials', 'Pair of Linear Equations in Two Variables', 'Quadratic Equations', 'Arithmetic Progressions'],
          weightage: 20,
          estimatedHours: 40
        },
        {
          id: 'unit-3',
          name: 'Coordinate Geometry',
          topics: ['Lines', 'Distance Formula', 'Section Formula'],
          weightage: 6,
          estimatedHours: 15
        },
        {
          id: 'unit-4',
          name: 'Geometry',
          topics: ['Triangles', 'Circles', 'Constructions'],
          weightage: 15,
          estimatedHours: 30
        },
        {
          id: 'unit-5',
          name: 'Trigonometry',
          topics: ['Introduction to Trigonometry', 'Trigonometric Identities', 'Heights and Distances'],
          weightage: 12,
          estimatedHours: 25
        },
        {
          id: 'unit-6',
          name: 'Mensuration',
          topics: ['Areas Related to Circles', 'Surface Areas and Volumes'],
          weightage: 10,
          estimatedHours: 20
        },
        {
          id: 'unit-7',
          name: 'Statistics and Probability',
          topics: ['Statistics', 'Probability'],
          weightage: 11,
          estimatedHours: 20
        }
      ],
      totalMarks: 80,
      examPattern: {
        totalMarks: 80,
        duration: 180,
        sections: [
          {
            name: 'Section A',
            marks: 20,
            questionTypes: [{ type: 'MCQ', count: 20, marksPerQuestion: 1 }]
          },
          {
            name: 'Section B',
            marks: 20,
            questionTypes: [{ type: 'Short Answer', count: 10, marksPerQuestion: 2 }]
          },
          {
            name: 'Section C',
            marks: 30,
            questionTypes: [{ type: 'Long Answer', count: 10, marksPerQuestion: 3 }]
          },
          {
            name: 'Section D',
            marks: 10,
            questionTypes: [{ type: 'Long Answer', count: 2, marksPerQuestion: 5 }]
          }
        ],
        passingMarks: 33
      }
    });
  }

  private initializeExamMappings(): void {
    // JEE Main mapping
    this.examMappings.set('JEE Main', {
      exam: 'JEE Main',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      syllabus: ['Class 11 and 12 CBSE/State Board syllabus'],
      pattern: {
        totalMarks: 300,
        duration: 180,
        sections: [
          {
            name: 'Physics',
            marks: 100,
            questionTypes: [
              { type: 'MCQ', count: 20, marksPerQuestion: 4 },
              { type: 'Numerical', count: 5, marksPerQuestion: 4 }
            ]
          },
          {
            name: 'Chemistry',
            marks: 100,
            questionTypes: [
              { type: 'MCQ', count: 20, marksPerQuestion: 4 },
              { type: 'Numerical', count: 5, marksPerQuestion: 4 }
            ]
          },
          {
            name: 'Mathematics',
            marks: 100,
            questionTypes: [
              { type: 'MCQ', count: 20, marksPerQuestion: 4 },
              { type: 'Numerical', count: 5, marksPerQuestion: 4 }
            ]
          }
        ],
        passingMarks: 90
      },
      preparationTips: [
        'Focus on NCERT textbooks for conceptual clarity',
        'Practice previous year question papers',
        'Take regular mock tests',
        'Strengthen problem-solving skills',
        'Focus on time management'
      ],
      recommendedResources: [
        'NCERT Physics, Chemistry, Mathematics (Class 11 & 12)',
        'HC Verma - Concepts of Physics',
        'RD Sharma - Mathematics',
        'OP Tandon - Physical Chemistry',
        'Previous 10 years JEE Main papers'
      ]
    });

    // NEET mapping
    this.examMappings.set('NEET', {
      exam: 'NEET',
      subjects: ['Physics', 'Chemistry', 'Biology'],
      syllabus: ['Class 11 and 12 CBSE syllabus'],
      pattern: {
        totalMarks: 720,
        duration: 180,
        sections: [
          {
            name: 'Physics',
            marks: 180,
            questionTypes: [{ type: 'MCQ', count: 45, marksPerQuestion: 4 }]
          },
          {
            name: 'Chemistry',
            marks: 180,
            questionTypes: [{ type: 'MCQ', count: 45, marksPerQuestion: 4 }]
          },
          {
            name: 'Biology',
            marks: 360,
            questionTypes: [{ type: 'MCQ', count: 90, marksPerQuestion: 4 }]
          }
        ],
        passingMarks: 50 // Percentile based
      },
      preparationTips: [
        'Master NCERT thoroughly',
        'Focus on Biology - it has maximum weightage',
        'Practice diagrams and labeling',
        'Solve previous year papers',
        'Take regular mock tests'
      ],
      recommendedResources: [
        'NCERT Biology, Physics, Chemistry (Class 11 & 12)',
        'Trueman\'s Biology',
        'DC Pandey - Physics',
        'MS Chouhan - Organic Chemistry',
        'Previous 10 years NEET papers'
      ]
    });

    // UPSC mapping
    this.examMappings.set('UPSC', {
      exam: 'UPSC',
      subjects: ['General Studies', 'Optional Subject', 'Essay'],
      syllabus: ['Comprehensive syllabus covering History, Geography, Polity, Economy, Science, Current Affairs'],
      pattern: {
        totalMarks: 2025,
        duration: 10800, // Multiple papers
        sections: [
          {
            name: 'Prelims',
            marks: 400,
            questionTypes: [{ type: 'MCQ', count: 200, marksPerQuestion: 2 }]
          },
          {
            name: 'Mains',
            marks: 1750,
            questionTypes: [
              { type: 'Essay', count: 1, marksPerQuestion: 250 },
              { type: 'Long Answer', count: 100, marksPerQuestion: 15 }
            ]
          },
          {
            name: 'Interview',
            marks: 275,
            questionTypes: []
          }
        ],
        passingMarks: 900
      },
      preparationTips: [
        'Read newspapers daily (The Hindu, Indian Express)',
        'Make comprehensive notes',
        'Practice answer writing regularly',
        'Stay updated with current affairs',
        'Join test series for evaluation'
      ],
      recommendedResources: [
        'NCERT Books (Class 6-12)',
        'Laxmikanth - Indian Polity',
        'Spectrum - Modern History',
        'Ramesh Singh - Indian Economy',
        'Vision IAS Monthly Magazine'
      ]
    });
  }

  private extractTopics(content: any): string[] {
    // Simple topic extraction - in production, use NLP
    if (typeof content === 'string') {
      return [content];
    }
    if (content.topics) {
      return content.topics;
    }
    return [];
  }

  private findMatchingSubjects(topics: string[], board: EducationalBoard): Subject[] {
    const allSubjects: Subject[] = [];
    this.boardSubjects.forEach((subjects) => {
      allSubjects.push(...subjects.filter(s => s.board === board));
    });

    return allSubjects.filter(subject => {
      return topics.some(topic => 
        subject.topics.some(st => 
          st.toLowerCase().includes(topic.toLowerCase()) ||
          topic.toLowerCase().includes(st.toLowerCase())
        )
      );
    });
  }

  private calculateAlignmentScore(topics: string[], subjects: Subject[]): number {
    if (subjects.length === 0) return 0;
    
    let matchCount = 0;
    let totalTopics = topics.length;
    
    topics.forEach(topic => {
      const hasMatch = subjects.some(subject =>
        subject.topics.some(st => 
          st.toLowerCase().includes(topic.toLowerCase()) ||
          topic.toLowerCase().includes(st.toLowerCase())
        )
      );
      if (hasMatch) matchCount++;
    });
    
    return totalTopics > 0 ? matchCount / totalTopics : 0;
  }

  private determineDifficulty(_content: any, _board: EducationalBoard): 'Easy' | 'Medium' | 'Hard' {
    // Simple heuristic - in production, use ML model
    return 'Medium';
  }

  private findExamRelevance(topics: string[]): CompetitiveExam[] {
    const relevantExams: Set<CompetitiveExam> = new Set();
    
    this.boardSubjects.forEach((subjects) => {
      subjects.forEach(subject => {
        const hasMatch = topics.some(topic =>
          subject.topics.some(st => 
            st.toLowerCase().includes(topic.toLowerCase())
          )
        );
        if (hasMatch) {
          subject.examRelevance.forEach(exam => relevantExams.add(exam));
        }
      });
    });
    
    return Array.from(relevantExams);
  }

  private createDefaultSyllabus(board: EducationalBoard, grade: number, subject: string): Syllabus {
    return {
      board,
      grade,
      subject,
      units: [],
      totalMarks: 100,
      examPattern: {
        totalMarks: 100,
        duration: 180,
        sections: [],
        passingMarks: 33
      }
    };
  }

  private createDefaultExamMapping(exam: CompetitiveExam): ExamMapping {
    return {
      exam,
      subjects: [],
      syllabus: [],
      pattern: {
        totalMarks: 100,
        duration: 180,
        sections: [],
        passingMarks: 33
      },
      preparationTips: [],
      recommendedResources: []
    };
  }

  private generateWeeklySchedule(subjects: Subject[], _exam: CompetitiveExam): WeeklySchedule {
    return {
      monday: subjects.slice(0, 2).map(s => ({ subject: s.name, hours: 2 })),
      tuesday: subjects.slice(0, 2).map(s => ({ subject: s.name, hours: 2 })),
      wednesday: subjects.slice(0, 2).map(s => ({ subject: s.name, hours: 2 })),
      thursday: subjects.slice(0, 2).map(s => ({ subject: s.name, hours: 2 })),
      friday: subjects.slice(0, 2).map(s => ({ subject: s.name, hours: 2 })),
      saturday: [{ subject: 'Revision', hours: 4 }],
      sunday: [{ subject: 'Mock Test', hours: 3 }]
    };
  }

  private generateMilestones(_grade: number, _exam: CompetitiveExam): Milestone[] {
    return [
      {
        id: 'milestone-1',
        name: 'Complete Syllabus',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        tasks: ['Finish all chapters', 'Make notes', 'Solve NCERT exercises']
      },
      {
        id: 'milestone-2',
        name: 'Revision Phase',
        deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        tasks: ['Revise all topics', 'Practice previous papers', 'Identify weak areas']
      },
      {
        id: 'milestone-3',
        name: 'Mock Test Phase',
        deadline: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        tasks: ['Take 20 mock tests', 'Analyze performance', 'Improve speed and accuracy']
      }
    ];
  }
}

// Supporting interfaces
export interface StudyPlan {
  board: EducationalBoard;
  grade: number;
  targetExam: CompetitiveExam;
  subjects: string[];
  weeklySchedule: WeeklySchedule;
  milestones: Milestone[];
  resources: string[];
}

export interface WeeklySchedule {
  monday: DaySchedule[];
  tuesday: DaySchedule[];
  wednesday: DaySchedule[];
  thursday: DaySchedule[];
  friday: DaySchedule[];
  saturday: DaySchedule[];
  sunday: DaySchedule[];
}

export interface DaySchedule {
  subject: string;
  hours: number;
}

export interface Milestone {
  id: string;
  name: string;
  deadline: Date;
  tasks: string[];
}

// Singleton instance
export const curriculumAdapter = new CurriculumAdapter();
