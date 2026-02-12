import React, { useState } from 'react';
import { Icons } from '../Icons';
import { useCourseStore } from '../../store/useCourseStore';
import { YouTubeSearchModal } from '../Modals/YouTubeSearchModal';
import { AddContentModal } from '../Modals/AddContentModal';
import { CourseCreationChatModal } from '../Modals/CourseCreationChatModal';

export const CoursePanel: React.FC = () => {
  const {
    courses,
    enrolledCourses,
    activeCourseId,
    activeModuleId,
    courseProgress,
    setActiveCourse,
    setActiveModule,
    updateCourseProgress,
    recordQuizScore,
    updateModule,
    deleteModule
  } = useCourseStore();

  const [view, setView] = useState<'browse' | 'learning' | 'create'>('browse');
  const [showModuleOptions, setShowModuleOptions] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showYouTubeSearch, setShowYouTubeSearch] = useState(false);
  const [currentModuleForVideo, setCurrentModuleForVideo] = useState<string | null>(null);
  const [newCourseTopic, setNewCourseTopic] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [showCourseCreationChat, setShowCourseCreationChat] = useState(false);

  const activeCourse = courses.find(c => c.id === activeCourseId);
  const activeModule = activeCourse?.modules.find(m => m.id === activeModuleId);
  const progress = activeCourseId ? courseProgress[activeCourseId] : null;

  const handleEnroll = (courseId: string) => {
    useCourseStore.getState().enrollInCourse(courseId);
    setActiveCourse(courseId);
    const course = courses.find(c => c.id === courseId);
    if (course && course.modules.length > 0) {
      setActiveModule(course.modules[0].id);
    }
    setView('learning');
  };

  const handleModuleComplete = () => {
    if (activeCourseId && activeModuleId) {
      updateCourseProgress(activeCourseId, activeModuleId);
      
      const currentIndex = activeCourse?.modules.findIndex(m => m.id === activeModuleId) || 0;
      const nextModule = activeCourse?.modules[currentIndex + 1];
      if (nextModule) {
        setActiveModule(nextModule.id);
      }
    }
  };

  const handleQuizSubmit = () => {
    if (!activeModule?.quiz) return;

    let correct = 0;
    activeModule.quiz.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) correct++;
    });

    const score = (correct / activeModule.quiz.questions.length) * 100;
    
    if (activeCourseId && activeModule.quiz.id) {
      recordQuizScore(activeCourseId, activeModule.quiz.id, score);
    }

    setShowResults(true);
  };

  const handleDeleteModule = (moduleId: string) => {
    if (activeCourseId && confirm('Remove this module from the course?')) {
      deleteModule(activeCourseId, moduleId);
      setShowModuleOptions(null);
    }
  };

  const handleReplaceVideo = (moduleId: string) => {
    setCurrentModuleForVideo(moduleId);
    setShowYouTubeSearch(true);
    setShowModuleOptions(null);
  };

  const handleAddVideo = (videoId: string, title: string, duration: number) => {
    if (activeCourseId && currentModuleForVideo) {
      const module = activeCourse?.modules.find(m => m.id === currentModuleForVideo);
      if (module) {
        updateModule(activeCourseId, currentModuleForVideo, {
          videos: [{
            ...module.videos[0],
            youtubeId: videoId,
            title: title,
            duration: duration
          }]
        });
      }
    }
    setShowYouTubeSearch(false);
    setCurrentModuleForVideo(null);
  };

  const handleCreateCourse = async () => {
    if (!newCourseTopic.trim()) return;

    setCreatingCourse(true);
    try {
      const { courseGenerator } = await import('../../src/services/CourseGeneratorService');
      const userProfile = useCourseStore.getState().userProfile || {
        interests: [newCourseTopic],
        goals: ['Learn new skills'],
        currentLevel: 'beginner' as const,
        preferredLanguage: 'en',
        learningStyle: 'visual' as const,
        timeCommitment: 5
      };

      const course = await courseGenerator.generateCourse(newCourseTopic, userProfile, 5);
      useCourseStore.getState().addCourse(course);
      setNewCourseTopic('');
      setView('browse');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleAddContentClick = () => {
    setShowAddContent(true);
  };

  const handleAddVideoFromModal = () => {
    setShowAddContent(false);
    setShowYouTubeSearch(true);
  };

  const handleAddDocument = (file: File) => {
    console.log('Document uploaded:', file.name);
    // TODO: Implement document upload logic
    alert(`Document "${file.name}" will be added to the module. (Feature coming soon!)`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Coursera-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setView('browse')}
                className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                  view === 'browse'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                Explore
              </button>
              {enrolledCourses.length > 0 && (
                <button
                  onClick={() => setView('learning')}
                  className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                    view === 'learning'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  My Learning
                </button>
              )}
            </div>
            <button
              onClick={() => setShowCourseCreationChat(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Icons.Sparkles size={16} />
              Create with AI
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Browse View - Coursera Style */}
        {view === 'browse' && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Courses</h1>
            <p className="text-gray-600 mb-8">Learn new skills with expert-curated courses</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div className="relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-44 object-cover"
                    />
                    {course.enrolled && (
                      <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded">
                        Enrolled
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wide">
                      {course.difficulty}
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mb-4 gap-4">
                      <span className="flex items-center gap-1">
                        <Icons.BookOpen size={14} />
                        {course.modules.length} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Icons.Clock size={14} />
                        {Math.floor(course.totalDuration / 60)}h {course.totalDuration % 60}m
                      </span>
                    </div>
                    {course.enrolled ? (
                      <button
                        onClick={() => {
                          setActiveCourse(course.id);
                          if (course.modules.length > 0) {
                            setActiveModule(course.modules[0].id);
                          }
                          setView('learning');
                        }}
                        className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                      >
                        Continue Learning
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        className="w-full py-2.5 border-2 border-blue-600 text-blue-600 text-sm font-medium rounded hover:bg-blue-50 transition-colors"
                      >
                        Enroll for Free
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning View - Coursera Style */}
        {view === 'learning' && activeCourse && (
          <div className="h-full flex">
            {/* Left Sidebar - Course Navigation */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-bold text-lg text-gray-900 mb-1">{activeCourse.title}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${activeCourse.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{Math.round(activeCourse.progress)}%</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeCourse.modules.map((module, index) => {
                  const isCompleted = progress?.completedModules.includes(module.id);
                  const isActive = module.id === activeModuleId;

                  return (
                    <div key={module.id} className="border-b border-gray-100">
                      <button
                        onClick={() => setActiveModule(module.id)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          isActive ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {isCompleted ? (
                              <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                                <Icons.Check size={14} className="text-white" />
                              </div>
                            ) : (
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isActive ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                              }`}>
                                {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1">Module {index + 1}</div>
                            <div className="font-medium text-sm text-gray-900 mb-1">{module.title}</div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Icons.Play size={12} />
                                {module.duration} min
                              </span>
                              {module.quiz && (
                                <span className="flex items-center gap-1">
                                  <Icons.FileText size={12} />
                                  Quiz
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}

                {/* Add Content Button */}
                <div className="p-4 border-b border-gray-100">
                  <button
                    onClick={handleAddContentClick}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-blue-600">
                      <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-600 flex items-center justify-center transition-colors">
                        <Icons.Plus size={20} className="text-gray-600 group-hover:text-white" />
                      </div>
                      <span className="font-medium text-sm">Add Content</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {activeModule && (
                <>
                  {/* Video Player */}
                  <div className="relative bg-black" style={{ paddingTop: '56.25%' }}>
                    {activeModule.videos[0].youtubeId ? (
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${activeModule.videos[0].youtubeId}`}
                        title={activeModule.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                        <Icons.Video size={64} className="mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No Video Added</h3>
                        <p className="text-gray-400 text-center mb-6">
                          {activeModule.videos[0].suggestedSearch 
                            ? `Search for: "${activeModule.videos[0].suggestedSearch}"`
                            : 'Add a YouTube video to this module'}
                        </p>
                        <button
                          onClick={() => {
                            setCurrentModuleForVideo(activeModule.id);
                            setShowYouTubeSearch(true);
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Search YouTube Videos
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="max-w-4xl mx-auto px-6 py-8">
                    {/* Video Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{activeModule.title}</h1>
                      <p className="text-gray-600 mb-6">{activeModule.description}</p>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={handleModuleComplete}
                          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                          Mark as Complete
                        </button>
                      </div>
                    </div>

                    {/* Inline Quiz */}
                    {activeModule.quiz && (
                      <div className="bg-white rounded-lg border border-gray-200 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Icons.FileText size={24} className="text-blue-600" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{activeModule.quiz.title}</h2>
                            <p className="text-sm text-gray-600">
                              {activeModule.quiz.questions.length} questions • {activeModule.quiz.timeLimit} minutes
                            </p>
                          </div>
                        </div>
                        
                        {!showResults ? (
                          <div className="space-y-8">
                            {activeModule.quiz.questions.map((question, index) => (
                              <div key={question.id} className="pb-8 border-b border-gray-200 last:border-0">
                                <p className="font-medium text-lg text-gray-900 mb-4">
                                  {index + 1}. {question.question}
                                </p>
                                <div className="space-y-3">
                                  {question.options.map((option, optIndex) => (
                                    <label
                                      key={optIndex}
                                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                        quizAnswers[question.id] === optIndex
                                          ? 'border-blue-600 bg-blue-50'
                                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={question.id}
                                        checked={quizAnswers[question.id] === optIndex}
                                        onChange={() => setQuizAnswers({ ...quizAnswers, [question.id]: optIndex })}
                                        className="mt-1 mr-3"
                                      />
                                      <span className="text-gray-900">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                            
                            <button
                              onClick={handleQuizSubmit}
                              disabled={Object.keys(quizAnswers).length < activeModule.quiz.questions.length}
                              className="w-full py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Submit Quiz
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-6xl mb-4">
                              {(Object.keys(quizAnswers).filter(qId => {
                                const q = activeModule.quiz!.questions.find(q => q.id === qId);
                                return q && quizAnswers[qId] === q.correctAnswer;
                              }).length / activeModule.quiz.questions.length) * 100 >= activeModule.quiz.passingScore ? '🎉' : '📚'}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                              {Math.round((Object.keys(quizAnswers).filter(qId => {
                                const q = activeModule.quiz!.questions.find(q => q.id === qId);
                                return q && quizAnswers[qId] === q.correctAnswer;
                              }).length / activeModule.quiz.questions.length) * 100)}%
                            </h2>
                            <p className="text-gray-600 mb-8">
                              {(Object.keys(quizAnswers).filter(qId => {
                                const q = activeModule.quiz!.questions.find(q => q.id === qId);
                                return q && quizAnswers[qId] === q.correctAnswer;
                              }).length / activeModule.quiz.questions.length) * 100 >= activeModule.quiz.passingScore
                                ? 'Congratulations! You passed the quiz.'
                                : 'Keep practicing to improve your score.'}
                            </p>
                            <button
                              onClick={() => {
                                setShowResults(false);
                                setQuizAnswers({});
                              }}
                              className="px-8 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
                            >
                              Retake Quiz
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Create Course View */}
        {view === 'create' && (
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Course</h1>
              <p className="text-gray-600 mb-8">
                Enter a topic and we'll generate a complete course with videos, quizzes, and assignments.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Course Topic
                  </label>
                  <input
                    type="text"
                    value={newCourseTopic}
                    onChange={(e) => setNewCourseTopic(e.target.value)}
                    placeholder="e.g., Machine Learning, React Development"
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    disabled={creatingCourse}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">What you'll get:</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <Icons.Check size={16} className="mt-0.5 flex-shrink-0" />
                      <span>5 comprehensive modules with curated YouTube videos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Check size={16} className="mt-0.5 flex-shrink-0" />
                      <span>AI-generated quizzes to test your knowledge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icons.Check size={16} className="mt-0.5 flex-shrink-0" />
                      <span>Practical assignments with grading rubrics</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setView('browse')}
                    disabled={creatingCourse}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCourse}
                    disabled={!newCourseTopic.trim() || creatingCourse}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingCourse ? 'Creating...' : 'Create Course'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* YouTube Search Modal */}
      <YouTubeSearchModal
        isOpen={showYouTubeSearch}
        onClose={() => {
          setShowYouTubeSearch(false);
          setCurrentModuleForVideo(null);
        }}
        onSelectVideo={handleAddVideo}
        suggestedSearch={
          currentModuleForVideo
            ? activeCourse?.modules.find(m => m.id === currentModuleForVideo)?.videos[0].suggestedSearch
            : undefined
        }
      />

      {/* Add Content Modal */}
      <AddContentModal
        isOpen={showAddContent}
        onClose={() => setShowAddContent(false)}
        onAddVideo={handleAddVideoFromModal}
        onAddDocument={handleAddDocument}
      />

      {/* Course Creation Chat Modal */}
      <CourseCreationChatModal
        isOpen={showCourseCreationChat}
        onClose={() => setShowCourseCreationChat(false)}
        onCourseCreated={(courseId) => {
          setShowCourseCreationChat(false);
          setActiveCourse(courseId);
          setView('learning');
        }}
      />
    </div>
  );
};
