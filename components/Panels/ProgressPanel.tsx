import React from 'react';
import { Card } from '../../src/components/DesignSystem/Card';
import { ProgressBar } from '../../src/components/DesignSystem/ProgressBar';
import { Icons } from '../Icons';
import { useCourseStore } from '../../store/useCourseStore';

/**
 * ProgressPanel - Clean Progress Tracking View
 * 
 * Displays:
 * - Course progress
 * - Quiz scores
 * - Assignment grades
 * - Learning statistics
 */
export const ProgressPanel: React.FC = () => {
  const { courses, enrolledCourses, courseProgress, userProfile } = useCourseStore();
  
  const enrolledCoursesData = courses.filter(c => enrolledCourses.includes(c.id));

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-neutral-50)]">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold text-[var(--color-neutral-900)] mb-2">
            Your Progress
          </h1>
          <p className="text-lg text-[var(--color-neutral-600)]">
            Track your learning journey and achievements
          </p>
        </header>

        {/* Overall Progress */}
        <Card variant="elevated" padding="lg">
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-900)] mb-6">
            Overall Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-[var(--color-neutral-600)] mb-2">Courses Completed</p>
              <p className="text-4xl font-bold text-[var(--color-primary-500)]">
                {enrolledCoursesData.filter(c => c.progress === 100).length}
              </p>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                of {enrolledCoursesData.length} enrolled
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral-600)] mb-2">Total Time Spent</p>
              <p className="text-4xl font-bold text-[var(--color-success-main)]">
                {Math.floor(Object.values(courseProgress).reduce((sum, p) => sum + p.timeSpent, 0) / 60)}h
              </p>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                learning time
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral-600)] mb-2">Average Score</p>
              <p className="text-4xl font-bold text-[var(--color-warning-main)]">
                {Math.round(
                  Object.values(courseProgress).reduce((sum, p) => {
                    const scores = Object.values(p.quizScores);
                    return sum + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
                  }, 0) / Math.max(Object.values(courseProgress).length, 1)
                )}%
              </p>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                quiz average
              </p>
            </div>
          </div>
        </Card>

        {/* Course Progress */}
        <section>
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-900)] mb-4">
            Course Progress
          </h2>
          <div className="space-y-4">
            {enrolledCoursesData.map(course => {
              const progress = courseProgress[course.id];
              return (
                <Card key={course.id} variant="outlined" padding="md">
                  <div className="flex items-start gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--color-neutral-900)] mb-2">
                        {course.title}
                      </h3>
                      <ProgressBar
                        value={course.progress}
                        showLabel
                        label="Overall Progress"
                        className="mb-3"
                      />
                      <div className="flex items-center gap-6 text-sm text-[var(--color-neutral-600)]">
                        <span>
                          <Icons.CheckCircle size={16} className="inline mr-1" />
                          {progress?.completedModules.length || 0} / {course.modules.length} modules
                        </span>
                        <span>
                          <Icons.Clock size={16} className="inline mr-1" />
                          {Math.floor((progress?.timeSpent || 0) / 60)}h {(progress?.timeSpent || 0) % 60}m
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quiz Scores */}
        <section>
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-900)] mb-4">
            Recent Quiz Scores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(courseProgress).flatMap(([courseId, progress]) =>
              Object.entries(progress.quizScores).map(([quizId, score]) => {
                const course = courses.find(c => c.id === courseId);
                return (
                  <Card key={`${courseId}-${quizId}`} variant="elevated" padding="md">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-[var(--color-neutral-700)]">
                        {course?.title}
                      </p>
                      <span className={`text-2xl font-bold ${
                        score >= 80
                          ? 'text-[var(--color-success-main)]'
                          : score >= 60
                          ? 'text-[var(--color-warning-main)]'
                          : 'text-[var(--color-error-main)]'
                      }`}>
                        {Math.round(score)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={score}
                      color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}
                      size="sm"
                    />
                  </Card>
                );
              })
            ).slice(0, 6)}
          </div>
        </section>

        {/* Achievements */}
        <section>
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-900)] mb-4">
            Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="outlined" padding="md" className="text-center">
              <div className="text-4xl mb-2">🎓</div>
              <p className="font-semibold text-[var(--color-neutral-900)]">First Course</p>
              <p className="text-xs text-[var(--color-neutral-600)]">Enrolled in a course</p>
            </Card>
            <Card variant="outlined" padding="md" className="text-center">
              <div className="text-4xl mb-2">⭐</div>
              <p className="font-semibold text-[var(--color-neutral-900)]">Quiz Master</p>
              <p className="text-xs text-[var(--color-neutral-600)]">Scored 100% on a quiz</p>
            </Card>
            <Card variant="outlined" padding="md" className="text-center">
              <div className="text-4xl mb-2">🔥</div>
              <p className="font-semibold text-[var(--color-neutral-900)]">7-Day Streak</p>
              <p className="text-xs text-[var(--color-neutral-600)]">Learned for 7 days</p>
            </Card>
            <Card variant="outlined" padding="md" className="text-center">
              <div className="text-4xl mb-2">🏆</div>
              <p className="font-semibold text-[var(--color-neutral-900)]">Completionist</p>
              <p className="text-xs text-[var(--color-neutral-600)]">Finished a course</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};
