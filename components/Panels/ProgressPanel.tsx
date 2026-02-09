import React from 'react';
import { ProgressVisualization } from '../../src/components/AI/ProgressVisualization';

/**
 * ProgressPanel - Dedicated Progress & Gamification View
 * 
 * Displays progress tracking, badges, streaks, and goals
 */
export const ProgressPanel: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-4">
      <ProgressVisualization />
    </div>
  );
};
