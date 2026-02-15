import React from 'react';

interface PredictionIndicatorProps {
  prediction: {
    metric: string;
    value: number;
    confidence: number;
    trend?: 'up' | 'down' | 'stable';
  };
  className?: string;
}

export const PredictionIndicator: React.FC<PredictionIndicatorProps> = ({
  prediction,
  className = ''
}) => {
  const { metric, value, confidence, trend = 'stable' } = prediction;

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→'
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    stable: 'text-gray-500'
  };

  const confidenceColor = confidence >= 0.8 
    ? 'text-green-600' 
    : confidence >= 0.5 
    ? 'text-yellow-600' 
    : 'text-red-600';

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">{metric}</h4>
        <span className={`text-2xl ${trendColors[trend]}`}>{trendIcons[trend]}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}%</span>
        <span className={`text-sm font-medium ${confidenceColor}`}>
          {Math.round(confidence * 100)}% confidence
        </span>
      </div>
      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
    </div>
  );
};
