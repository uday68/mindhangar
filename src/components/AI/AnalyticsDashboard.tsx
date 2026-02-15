import React from 'react';

interface AnalyticsData {
  studyTime: number;
  completedTasks: number;
  averageScore: number;
  streak: number;
}

interface AnalyticsDashboardProps {
  data?: AnalyticsData;
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data = {
    studyTime: 0,
    completedTasks: 0,
    averageScore: 0,
    streak: 0
  },
  className = ''
}) => {
  const metrics = [
    {
      label: 'Study Time',
      value: `${Math.round(data.studyTime / 60)}h`,
      icon: '⏱️',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'Completed Tasks',
      value: data.completedTasks,
      icon: '✅',
      color: 'bg-green-50 text-green-600'
    },
    {
      label: 'Average Score',
      value: `${data.averageScore}%`,
      icon: '📊',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      label: 'Streak',
      value: `${data.streak} days`,
      icon: '🔥',
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{metric.label}</span>
            <span className={`text-2xl p-2 rounded-lg ${metric.color}`}>
              {metric.icon}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
        </div>
      ))}
    </div>
  );
};
