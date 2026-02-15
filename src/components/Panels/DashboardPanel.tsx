import React from 'react';
import { Card } from '../DesignSystem/Card';
import { Button } from '../DesignSystem/Button';
import { ProgressBar } from '../DesignSystem/ProgressBar';
import { Icons } from '../Icons';
import { useCourseStore } from '@/store/useCourseStore';

/**
 * DashboardPanel - Coursera-Inspired Learning Dashboard
 * 
 * Clean, elegant dashboard with:
 * - Course progress overview
 * - Quick actions
 * - Upcoming tasks
 * - Learning statistics
 */
export const DashboardPanel: React.FC = () => {
  const { courses, enrolledCourses, courseProgress, userProfile } = useCourseStore();
  
  const enrolledCoursesData = courses.filter(c => enrolledCourses.includes(c.id));
  
  // Calculate stats
  const totalCourses = enrolledCoursesData.length;
  const completedCourses = enrolledCoursesData.filter(c => c.progress === 100).length;
  const totalTimeSpent = Object.values(courseProgress).reduce((sum, p) => sum + p.timeSpent, 0);
  const avgProgress = enrolledCoursesData.length > 0
    ? enrolledCoursesData.reduce((sum, c) => sum + c.progress, 0) / enrolledCoursesData.length
    : 0;

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-neutral-50)]">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold text-[var(--color-neutral-900)] mb-2">
            Welcome back{userProfile?.interests?.[0] ? `, ${userProfile.interests[0]} learner` : ''}!
          </h1>
          <p className="text-lg text-[var(--color-neutral-600)]">
            Continue your learning journey
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-primary-100)] rounded-lg">
                <Icons.BookOpen size={24} className="text-[var(--color-primary-500)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-neutral-600)]">Enrolled Courses</p>
                <p className="text-3xl font-bold text-[var(--color-neutral-900)]">{totalCourses}</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-success-light)] rounded-lg">
                <Icons.CheckCircle size={24} className="text-[var(--color-success-main)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-neutral-600)]">Completed</p>
                <p className="text-3xl font-bold text-[var(--color-neutral-900)]">{completedCourses}</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-warning-light)] rounded-lg">
                <Icons.Clock size={24} className="text-[var(--color-warning-main)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-neutral-600)]">Time Spent</p>
                <p className="text-3xl font-bold text-[var(--color-neutral-900)]">{Math.floor(totalTimeSpent / 60)}h</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--color-info-light)] rounded-lg">
                <Icons.TrendingUp size={24} className="text-[var(--color-info-main)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-neutral-600)]">Avg Progress</p>
                <p className="text-3xl font-bold text-[var(--color-neutral-900)]">{Math.round(avgProgress)}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Continue Learning */}
        <section>
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-900)] mb-4">
            Continue Learning
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrolledCoursesData.slice(0, 4).map(course => (
              <Card key={course.id} variant="elevated" padding="md" className="hover:shadow-xl transition-shadow">
                <div className="flex gap-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-neutral-900)] mb-2">
                      {course.title}
                    </h3>
                    <ProgressBar
                      value={course.progress}
                      size="sm"
                      showLabel
                      className="mb-3"
                    />
                    <Button size="sm" variant="primary">
                      Continue
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-900)] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              icon={<Icons.Search size={20} />}
            >
              Browse Courses
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              icon={<Icons.FileText size={20} />}
            >
              Take Quick Quiz
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              icon={<Icons.BookOpen size={20} />}
            >
              View Notes
            </Button>
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-900)] mb-4">
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.filter(c => !c.enrolled).slice(0, 3).map(course => (
              <Card key={course.id} variant="outlined" padding="md" className="hover:border-[var(--color-primary-500)] transition-colors">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-[var(--color-neutral-900)] mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-[var(--color-neutral-600)] mb-4 line-clamp-2">
                  {course.description}
                </p>
                <Button variant="primary" size="sm" fullWidth>
                  Enroll Now
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
