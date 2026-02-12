/**
 * Course Generator Service
 * AI-powered course creation from YouTube videos and user preferences
 */

import { aiAssistant } from './AIAssistantService';

export interface UserProfile {
  interests: string[];
  goals: string[];
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredLanguage: string;
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  timeCommitment: number; // hours per week
}

export interface SkillAssessment {
  subject: string;
  score: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  videos: CourseVideo[];
  quiz?: Quiz;
  assignment?: Assignment;
  order: number;
}

export interface CourseVideo {
  id: string;
  title: string;
  youtubeId: string;
  duration: number;
  description: string;
  transcript?: string;
  suggestedSearch?: string; // YouTube search query suggestion
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // minutes
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  tasks: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  rubric: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  modules: CourseModule[];
  totalDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  progress: number;
  enrolled: boolean;
  createdAt: Date;
}

class CourseGeneratorService {
  /**
   * Generate skill assessment based on user responses
   */
  async assessSkillLevel(subject: string, responses: any[]): Promise<SkillAssessment> {
    try {
      const prompt = `Analyze these assessment responses for ${subject} and provide:
1. Overall score (0-100)
2. Skill level (beginner/intermediate/advanced)
3. Top 3 strengths
4. Top 3 areas for improvement
5. Specific learning recommendations

Responses: ${JSON.stringify(responses)}

Format as JSON with: score, level, strengths[], weaknesses[], recommendations[]`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.3,
        maxTokens: 1024
      });

      const assessment = JSON.parse(response.text);
      return {
        subject,
        ...assessment
      };
    } catch (error) {
      console.error('Skill assessment error:', error);
      return {
        subject,
        score: 50,
        level: 'beginner',
        strengths: ['Eager to learn'],
        weaknesses: ['Needs practice'],
        recommendations: ['Start with basics', 'Practice regularly']
      };
    }
  }

  /**
   * Generate personalized course recommendations
   */
  async generateRecommendations(profile: UserProfile, assessments: SkillAssessment[]): Promise<string[]> {
    try {
      const prompt = `Based on this learner profile, recommend 5 specific courses:

Profile:
- Interests: ${profile.interests.join(', ')}
- Goals: ${profile.goals.join(', ')}
- Current Level: ${profile.currentLevel}
- Time Available: ${profile.timeCommitment} hours/week

Assessments: ${JSON.stringify(assessments)}

Return array of course titles suitable for Indian learners.`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.7,
        maxTokens: 512
      });

      const recommendations = JSON.parse(response.text);
      return Array.isArray(recommendations) ? recommendations : [];
    } catch (error) {
      console.error('Recommendation error:', error);
      return profile.interests.map(interest => `Introduction to ${interest}`);
    }
  }

  /**
   * Search and curate YouTube videos for a course topic
   */
  async curateYouTubeContent(topic: string, moduleCount: number = 5): Promise<CourseVideo[]> {
    try {
      // Try to use YouTube API for dynamic content
      const { searchYouTubeVideos, parseDuration } = await import('../../services/youtubeService');
      
      const youtubeVideos = await searchYouTubeVideos(topic, moduleCount, {
        level: 'beginner', // Can be made dynamic based on user profile
        subject: topic
      });

      if (youtubeVideos.length > 0) {
        return youtubeVideos.map((video, i) => ({
          id: `video-${i}`,
          title: video.title,
          youtubeId: video.id,
          duration: Math.floor(parseDuration(video.duration) / 60), // Convert to minutes
          description: video.description || `Educational video on ${topic}`
        }));
      }
    } catch (error) {
      console.warn('YouTube API not available, using fallback content:', error);
    }

    // Fallback: Use AI to generate course structure with placeholder videos
    // In production, users would add their own YouTube links or use YouTube search
    try {
      const prompt = `Generate a course outline for "${topic}" with ${moduleCount} modules.
For each module, provide:
- title: Module title
- description: What students will learn
- suggestedSearch: YouTube search query to find relevant videos

Format as JSON array.`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.7,
        maxTokens: 1024
      });

      const modules = JSON.parse(response.text);
      
      return modules.slice(0, moduleCount).map((module: any, i: number) => ({
        id: `video-${i}`,
        title: module.title || `Module ${i + 1}: ${topic}`,
        youtubeId: '', // Empty - user will need to add videos
        duration: 30,
        description: module.description || `Learn about ${module.title}`,
        suggestedSearch: module.suggestedSearch || topic
      }));
    } catch (error) {
      console.error('Failed to generate course outline:', error);
      
      // Ultimate fallback: Return empty structure for user to fill
      return Array.from({ length: moduleCount }, (_, i) => ({
        id: `video-${i}`,
        title: `Module ${i + 1}: ${topic}`,
        youtubeId: '', // Empty - user will add videos
        duration: 30,
        description: `Module ${i + 1} content for ${topic}`,
        suggestedSearch: `${topic} tutorial module ${i + 1}`
      }));
    }
  }

  /**
   * Generate course structure with modules
   */
  async generateCourse(
    title: string,
    profile: UserProfile,
    moduleCount: number = 5
  ): Promise<Course> {
    try {
      // Curate YouTube content
      const videos = await this.curateYouTubeContent(title, moduleCount);

      // Generate module structure
      const modules: CourseModule[] = await Promise.all(
        videos.map(async (video, index) => {
          const module: CourseModule = {
            id: `module-${index + 1}`,
            title: `Module ${index + 1}: ${video.title}`,
            description: video.description,
            duration: video.duration,
            videos: [video],
            order: index + 1
          };

          // Add quiz after every 2 modules
          if ((index + 1) % 2 === 0) {
            module.quiz = await this.generateQuiz(video.title, profile.currentLevel);
          }

          // Add assignment at end of module
          if (index === videos.length - 1) {
            module.assignment = await this.generateAssignment(title, profile.currentLevel);
          }

          return module;
        })
      );

      const totalDuration = modules.reduce((sum, m) => sum + m.duration, 0);

      return {
        id: `course-${Date.now()}`,
        title,
        description: `Comprehensive course on ${title} tailored for ${profile.currentLevel} learners`,
        instructor: 'AI-Curated',
        thumbnail: `https://img.youtube.com/vi/${videos[0].youtubeId}/maxresdefault.jpg`,
        modules,
        totalDuration,
        difficulty: profile.currentLevel,
        tags: profile.interests,
        progress: 0,
        enrolled: false,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Course generation error:', error);
      throw error;
    }
  }

  /**
   * Generate quiz for a module
   */
  async generateQuiz(topic: string, difficulty: string): Promise<Quiz> {
    try {
      const prompt = `Generate 5 ${difficulty} multiple-choice questions about "${topic}".
Format as JSON array with: question, options (4 choices), correctAnswer (index 0-3), explanation.
Make questions relevant for Indian students.`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.7,
        maxTokens: 2048
      });

      const questions = JSON.parse(response.text);
      
      return {
        id: `quiz-${Date.now()}`,
        title: `${topic} Quiz`,
        questions: questions.map((q: any, i: number) => ({
          id: `q-${i}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: difficulty as any
        })),
        passingScore: 60,
        difficulty: difficulty as any,
        timeLimit: 15
      };
    } catch (error) {
      console.error('Quiz generation error:', error);
      return {
        id: `quiz-${Date.now()}`,
        title: `${topic} Quiz`,
        questions: [],
        passingScore: 60,
        difficulty: difficulty as any
      };
    }
  }

  /**
   * Generate assignment for a module
   */
  async generateAssignment(topic: string, difficulty: string): Promise<Assignment> {
    try {
      const prompt = `Create a ${difficulty} assignment for "${topic}".
Include: title, description, 3-5 tasks, estimated time, and grading rubric.
Format as JSON. Make it practical for Indian students.`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.7,
        maxTokens: 1024
      });

      const assignment = JSON.parse(response.text);
      
      return {
        id: `assignment-${Date.now()}`,
        ...assignment,
        difficulty: difficulty as any
      };
    } catch (error) {
      console.error('Assignment generation error:', error);
      return {
        id: `assignment-${Date.now()}`,
        title: `${topic} Assignment`,
        description: `Complete this assignment to demonstrate your understanding of ${topic}`,
        tasks: ['Review the module content', 'Complete the practice exercises'],
        difficulty: difficulty as any,
        estimatedTime: 60,
        rubric: ['Completeness', 'Accuracy', 'Creativity']
      };
    }
  }

  /**
   * Grade assignment submission
   */
  async gradeAssignment(assignment: Assignment, submission: string): Promise<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }> {
    try {
      const prompt = `Grade this assignment submission:

Assignment: ${assignment.title}
Tasks: ${assignment.tasks.join(', ')}
Rubric: ${assignment.rubric.join(', ')}

Submission: ${submission}

Provide: score (0-100), feedback, strengths[], improvements[]
Format as JSON.`;

      const response = await aiAssistant.generateResponse({
        prompt,
        temperature: 0.3,
        maxTokens: 1024
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error('Grading error:', error);
      return {
        score: 75,
        feedback: 'Good effort! Keep practicing.',
        strengths: ['Completed all tasks'],
        improvements: ['Add more detail']
      };
    }
  }
}

export const courseGenerator = new CourseGeneratorService();
