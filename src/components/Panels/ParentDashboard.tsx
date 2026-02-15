import React, { useState, useEffect } from 'react';
import { multiRoleService, StudentProfile, ProgressSummary, ActivityAlert } from '../../services/MultiRoleService';
import { Icons } from '../Icons';

export const ParentDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [alerts, setAlerts] = useState<ActivityAlert[]>([]);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentData(selectedStudent);
    }
  }, [selectedStudent]);

  const loadDashboardData = async () => {
    const studentList = await multiRoleService.getStudents('parent_123', 'parent');
    setStudents(studentList);
    if (studentList.length > 0) {
      setSelectedStudent(studentList[0].id);
    }

    const alertList = multiRoleService.getAlerts('parent_123');
    setAlerts(alertList);
  };

  const loadStudentData = async (studentId: string) => {
    const progressSummary = await multiRoleService.generateProgressSummary(studentId, 'weekly');
    setSummary(progressSummary);
  };

  const setTimeLimit = async () => {
    if (!selectedStudent) return;

    await multiRoleService.setParentalControls(selectedStudent, {
      studentId: selectedStudent,
      timeLimit: {
        enabled: true,
        dailyMinutes: 120,
        weeklyMinutes: 600,
      },
      contentFilter: {
        enabled: true,
        allowedContentTypes: ['video', 'quiz', 'notes'],
        blockedTopics: [],
      },
      monitoring: {
        trackActivity: true,
        alertOnLowPerformance: true,
        alertOnInactivity: true,
        inactivityThresholdDays: 3,
      },
    });

    alert('Parental controls updated!');
  };

  const exportReport = async () => {
    if (!selectedStudent) return;

    const report = await multiRoleService.exportReport(selectedStudent, 'pdf');
    alert('Report exported! (In production, this would download a PDF)');
    console.log(report);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-blue-200 bg-white/80 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
          <Icons.Users size={28} />
          Parent Dashboard
        </h2>
        <p className="text-blue-600 mt-1">Monitor your child's learning progress</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Student Selector */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Student</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} - {student.grade} ({student.board})
              </option>
            ))}
          </select>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.AlertCircle size={20} className="text-orange-500" />
              Recent Alerts
            </h3>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : alert.severity === 'warning'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 capitalize">{alert.type.replace('_', ' ')}</div>
                      <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => multiRoleService.acknowledgeAlert(alert.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Overall Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time Spent</span>
                  <span className="font-bold text-blue-600">{summary.metrics.totalTimeSpent} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Content Completed</span>
                  <span className="font-bold text-green-600">{summary.metrics.contentCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-bold text-purple-600">{summary.metrics.averageScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-bold text-orange-600">{summary.metrics.streak} days 🔥</span>
                </div>
              </div>
            </div>

            {/* Subject Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Progress</h3>
              <div className="space-y-3">
                {summary.metrics.subjectProgress.map((subject) => (
                  <div key={subject.subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                      <span className="text-sm font-bold text-gray-900">{subject.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Concerns & Achievements */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Concerns */}
            {summary.concerns.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
                  <Icons.AlertCircle size={20} />
                  Areas of Concern
                </h3>
                <ul className="space-y-2">
                  {summary.concerns.map((concern, idx) => (
                    <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Achievements */}
            {summary.achievements.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                  <Icons.Award size={20} />
                  Recent Achievements
                </h3>
                <ul className="space-y-2">
                  {summary.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowControls(!showControls)}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Icons.Settings size={20} />
            Parental Controls
          </button>
          <button
            onClick={exportReport}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
          >
            <Icons.Download size={20} />
            Export Report
          </button>
          <button
            onClick={() => alert('Opening communication panel...')}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <Icons.MessageCircle size={20} />
            Message Teacher
          </button>
        </div>

        {/* Parental Controls Modal */}
        {showControls && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Parental Controls</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Daily Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    defaultValue={120}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">Track activity</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">Alert on low performance</span>
                  </label>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={setTimeLimit}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowControls(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
