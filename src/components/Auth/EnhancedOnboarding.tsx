import React, { useState } from 'react';
import { Icons } from '../Icons';
import { UserProfile, courseGenerator } from '../../services/CourseGeneratorService';
import { useCourseStore } from '@/store/useCourseStore';

export const EnhancedOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    interests: [],
    goals: [],
    currentLevel: 'beginner',
    preferredLanguage: 'en',
    learningStyle: 'visual',
    timeCommitment: 5
  });
  const [assessmentAnswers, setAssessmentAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { setUserProfile, addSkillAssessment } = useCourseStore();

  const interestOptions = [
    'Programming', 'Mathematics', 'Science', 'Languages', 'Business',
    'Design', 'Music', 'History', 'Engineering', 'Medicine'
  ];

  const goalOptions = [
    'Get a job', 'Learn new skills', 'Prepare for exams', 'Career change',
    'Personal growth', 'Start a business', 'Academic excellence'
  ];

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleInterest = (interest: string) => {
    const interests = profile.interests || [];
    setProfile({
      ...profile,
      interests: interests.includes(interest)
        ? interests.filter(i => i !== interest)
        : [...interests, interest]
    });
  };

  const toggleGoal = (goal: string) => {
    const goals = profile.goals || [];
    setProfile({
      ...profile,
      goals: goals.includes(goal)
        ? goals.filter(g => g !== goal)
        : [...goals, goal]
    });
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save profile
      setUserProfile(profile as UserProfile);

      // Generate skill assessment if answers provided
      if (assessmentAnswers.length > 0 && profile.interests && profile.interests[0]) {
        const assessment = await courseGenerator.assessSkillLevel(
          profile.interests[0],
          assessmentAnswers
        );
        addSkillAssessment(assessment);
      }

      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to MindHangar!</h2>
            <span className="text-sm text-gray-500">Step {step} of 5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Interests */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">What are you interested in?</h3>
                <p className="text-gray-600 text-sm">Select all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {interestOptions.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      profile.interests?.includes(interest)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">What are your learning goals?</h3>
                <p className="text-gray-600 text-sm">Select all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {goalOptions.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      profile.goals?.includes(goal)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Current Level */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">What's your current level?</h3>
                <p className="text-gray-600 text-sm">Be honest - we'll tailor content for you</p>
              </div>
              <div className="space-y-3">
                {[
                  { value: 'beginner', label: 'Beginner', desc: 'Just starting out' },
                  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
                  { value: 'advanced', label: 'Advanced', desc: 'Experienced learner' }
                ].map(level => (
                  <button
                    key={level.value}
                    onClick={() => setProfile({ ...profile, currentLevel: level.value as any })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      profile.currentLevel === level.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{level.label}</div>
                    <div className="text-sm text-gray-600">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Learning Style & Time */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">How do you learn best?</h3>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { value: 'visual', label: 'Visual', icon: Icons.Eye },
                    { value: 'auditory', label: 'Auditory', icon: Icons.Volume2 },
                    { value: 'reading', label: 'Reading', icon: Icons.BookOpen },
                    { value: 'kinesthetic', label: 'Hands-on', icon: Icons.Hand }
                  ].map(style => (
                    <button
                      key={style.value}
                      onClick={() => setProfile({ ...profile, learningStyle: style.value as any })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        profile.learningStyle === style.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <style.icon size={24} className="mx-auto mb-2" />
                      <div className="text-sm font-medium">{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  How many hours per week can you dedicate?
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={profile.timeCommitment}
                  onChange={(e) => setProfile({ ...profile, timeCommitment: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-center text-lg font-semibold text-blue-600 mt-2">
                  {profile.timeCommitment} hours/week
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Quick Assessment (Optional) */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Quick Skill Check</h3>
                <p className="text-gray-600 text-sm">
                  Answer a few questions to help us understand your level better (optional)
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <Icons.Info size={16} className="inline mr-2" />
                  You can skip this and start learning right away!
                </p>
              </div>
              <button
                onClick={handleComplete}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Skip & Start Learning
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          {step < 5 && (
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && (!profile.interests || profile.interests.length === 0)) ||
                (step === 2 && (!profile.goals || profile.goals.length === 0))
              }
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
