import React from 'react';
import { PredictionIndicator } from '../AI/PredictionIndicator';

/**
 * PredictionsPanel - Dedicated Performance Predictions View
 * 
 * Displays AI-powered performance predictions and recommendations
 */
export const PredictionsPanel: React.FC = () => {
  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
    // Future: Handle recommendation actions
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <PredictionIndicator onActionClick={handleActionClick} />
    </div>
  );
};
