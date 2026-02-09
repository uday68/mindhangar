import React from 'react';
import { RecommendationWidget } from '../../src/components/AI/RecommendationWidget';
import { AnalyticsDashboard } from '../../src/components/AI/AnalyticsDashboard';
import { ProgressVisualization } from '../../src/components/AI/ProgressVisualization';
import { PredictionIndicator } from '../../src/components/AI/PredictionIndicator';

/**
 * DashboardPanel - Comprehensive AI Learning Dashboard
 * 
 * Displays all AI components in a unified dashboard view:
 * - Progress visualization with gamification
 * - Performance predictions and alerts
 * - Personalized recommendations
 * - Learning analytics
 */
export const DashboardPanel: React.FC = () => {
  const handleRecommendationClick = (recommendation: any) => {
    console.log('Opening recommendation:', recommendation);
    // Future: Navigate to content or open in new panel
  };

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
    // Future: Handle recommendation actions
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Header */}
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          AI Learning Dashboard
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track your progress, get personalized recommendations, and insights
        </p>
      </header>

      {/* Progress Section */}
      <section>
        <ProgressVisualization />
      </section>

      {/* Predictions Section */}
      <section>
        <PredictionIndicator onActionClick={handleActionClick} />
      </section>

      {/* Two Column Layout for Recommendations and Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recommendations */}
        <section>
          <RecommendationWidget 
            maxItems={5}
            onRecommendationClick={handleRecommendationClick}
          />
        </section>

        {/* Analytics */}
        <section>
          <AnalyticsDashboard />
        </section>
      </div>
    </div>
  );
};
