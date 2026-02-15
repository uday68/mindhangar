import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../Icons';
import { developerAnalytics, UserFeedback, ContributionMetrics } from '../../services/DeveloperAnalyticsService';
import { AccessibleButton } from '../Buttons/AccessibleButton';
import { AccessibleInput } from '../Forms/AccessibleInput';
import { AccessibleSelect } from '../Forms/AccessibleSelect';
import { SkeletonLoader } from '../Loading/SkeletonLoader';
import { LoadingSpinner } from '../Loading/LoadingSpinner';

/**
 * Developer Tools Panel
 * 
 * Provides developers with:
 * - Analytics dashboard
 * - Feedback submission
 * - Contribution metrics
 * - Data export tools
 * - Open-source contribution tracking
 */

type TabType = 'analytics' | 'feedback' | 'contributions' | 'export';

export const DeveloperToolsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if analytics is enabled
    const enabled = localStorage.getItem('analytics_enabled') === 'true';
    setAnalyticsEnabled(enabled);
    setLoading(false);
  }, []);

  const handleToggleAnalytics = async () => {
    const newState = !analyticsEnabled;
    setAnalyticsEnabled(newState);
    await developerAnalytics.initialize({ enabled: newState });
  };

  const tabs = [
    { id: 'analytics' as TabType, label: 'Analytics', icon: <Icons.BarChart size={16} /> },
    { id: 'feedback' as TabType, label: 'Feedback', icon: <Icons.MessageCircle size={16} /> },
    { id: 'contributions' as TabType, label: 'Contributions', icon: <Icons.Users size={16} /> },
    { id: 'export' as TabType, label: 'Export', icon: <Icons.Download size={16} /> },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader variant="text" count={5} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icons.Code className="text-teal-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Developer Tools
            </h2>
          </div>
          
          {/* Analytics Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Analytics
            </span>
            <button
              onClick={handleToggleAnalytics}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                analyticsEnabled ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label="Toggle analytics"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  analyticsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && <AnalyticsTab enabled={analyticsEnabled} />}
          {activeTab === 'feedback' && <FeedbackTab />}
          {activeTab === 'contributions' && <ContributionsTab />}
          {activeTab === 'export' && <ExportTab />}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Analytics Tab
const AnalyticsTab: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (enabled) {
      const data = developerAnalytics.getAnalyticsSummary();
      setSummary(data);
    }
  }, [enabled]);

  if (!enabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-12"
      >
        <Icons.BarChart size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Analytics Disabled
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Enable analytics to see usage data and performance metrics
        </p>
      </motion.div>
    );
  }

  if (!summary) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Total Events</div>
          <div className="text-3xl font-bold">{summary.totalEvents.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Total Sessions</div>
          <div className="text-3xl font-bold">{summary.totalSessions}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Avg Session</div>
          <div className="text-3xl font-bold">{summary.avgSessionDuration}m</div>
        </div>
      </div>

      {/* Top Events */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Events
        </h3>
        <div className="space-y-2">
          {summary.topEvents.map((event: any, index: number) => (
            <div key={event.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {index + 1}. {event.name}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {event.count} events
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Metrics
        </h3>
        <div className="space-y-2">
          {summary.performanceMetrics.map((metric: any) => (
            <div key={metric.name} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {metric.name}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {metric.avg} {metric.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Feedback Tab
const FeedbackTab: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'bug' as UserFeedback['type'],
    title: '',
    description: '',
    category: '',
    priority: 'medium' as UserFeedback['priority'],
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = () => {
    const feedback = developerAnalytics.getAllFeedback();
    setFeedbackList(feedback);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await developerAnalytics.submitFeedback(formData);
      setShowForm(false);
      setFormData({
        type: 'bug',
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        email: '',
      });
      loadFeedback();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          User Feedback
        </h3>
        <AccessibleButton
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          size="sm"
        >
          <Icons.Plus size={16} />
          New Feedback
        </AccessibleButton>
      </div>

      {/* Feedback Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4"
          >
            <AccessibleSelect
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              options={[
                { value: 'bug', label: 'Bug Report' },
                { value: 'feature', label: 'Feature Request' },
                { value: 'improvement', label: 'Improvement' },
                { value: 'question', label: 'Question' },
              ]}
              required
            />

            <AccessibleInput
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={4}
                placeholder="Detailed description..."
                required
              />
            </div>

            <AccessibleInput
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., UI, Performance, AI"
              required
            />

            <AccessibleSelect
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
              required
            />

            <AccessibleInput
              label="Email (optional)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="For follow-up"
            />

            <div className="flex gap-2">
              <AccessibleButton
                type="submit"
                variant="primary"
                loading={submitting}
                disabled={submitting}
              >
                Submit Feedback
              </AccessibleButton>
              <AccessibleButton
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </AccessibleButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Feedback List */}
      <div className="space-y-2">
        {feedbackList.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No feedback submitted yet
          </div>
        ) : (
          feedbackList.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    feedback.type === 'bug' ? 'bg-red-100 text-red-700' :
                    feedback.type === 'feature' ? 'bg-blue-100 text-blue-700' :
                    feedback.type === 'improvement' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {feedback.type}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    feedback.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    feedback.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {feedback.priority}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {feedback.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feedback.description}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Category: {feedback.category}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

// Contributions Tab
const ContributionsTab: React.FC = () => {
  const [metrics, setMetrics] = useState<ContributionMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await developerAnalytics.getContributionMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load contribution metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!metrics) {
    return <div>Failed to load metrics</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Contributors</div>
          <div className="text-3xl font-bold">{metrics.totalContributors}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Contributions</div>
          <div className="text-3xl font-bold">{metrics.totalContributions}</div>
        </div>
      </div>

      {/* Contributions by Type */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Contributions by Type
        </h3>
        <div className="space-y-2">
          {Object.entries(metrics.contributionsByType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {type}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Contributors
        </h3>
        <div className="space-y-3">
          {metrics.topContributors.map((contributor, index) => (
            <div key={contributor.username} className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-400">
                #{index + 1}
              </span>
              {contributor.avatar && (
                <img
                  src={contributor.avatar}
                  alt={contributor.username}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {contributor.username}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {contributor.contributions} contributions
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Contributions */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Contributions
        </h3>
        <div className="space-y-3">
          {metrics.recentContributions.map((contribution, index) => (
            <div key={index} className="border-l-2 border-teal-500 pl-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded text-xs font-medium">
                  {contribution.type}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(contribution.date).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm text-gray-900 dark:text-white">
                {contribution.description}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                by {contribution.contributor}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">Want to Contribute?</h3>
        <p className="mb-4 opacity-90">
          Join our open-source community and help improve MindHangar
        </p>
        <div className="flex gap-2 justify-center">
          <AccessibleButton
            onClick={() => window.open('https://github.com/yourusername/mindhangar', '_blank')}
            variant="secondary"
          >
            <Icons.Github size={16} />
            View on GitHub
          </AccessibleButton>
          <AccessibleButton
            onClick={() => window.open('https://github.com/yourusername/mindhangar/blob/main/CONTRIBUTING.md', '_blank')}
            variant="secondary"
          >
            <Icons.FileText size={16} />
            Contributing Guide
          </AccessibleButton>
        </div>
      </div>
    </motion.div>
  );
};

// Export Tab
const ExportTab: React.FC = () => {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      const data = developerAnalytics.exportData(format);
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindhangar-analytics-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      developerAnalytics.clearData();
      alert('Analytics data cleared successfully');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Export Analytics Data
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Download all collected analytics data for analysis or backup
        </p>

        <div className="space-y-4">
          <AccessibleSelect
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
            options={[
              { value: 'json', label: 'JSON' },
              { value: 'csv', label: 'CSV' },
            ]}
          />

          <AccessibleButton
            onClick={handleExport}
            variant="primary"
            loading={exporting}
            disabled={exporting}
          >
            <Icons.Download size={16} />
            Export Data
          </AccessibleButton>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-4">
          Danger Zone
        </h3>
        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
          Clear all analytics data. This action cannot be undone.
        </p>
        <AccessibleButton
          onClick={handleClearData}
          variant="danger"
        >
          <Icons.Trash size={16} />
          Clear All Data
        </AccessibleButton>
      </div>
    </motion.div>
  );
};
