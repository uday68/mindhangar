import React from 'react';
import { AnalyticsDashboard } from '../../src/components/AI/AnalyticsDashboard';

/**
 * AnalyticsPanel - Dedicated Learning Analytics View
 * 
 * Displays detailed learning analytics with charts and insights
 */
export const AnalyticsPanel: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-4">
      <AnalyticsDashboard />
    </div>
  );
};
