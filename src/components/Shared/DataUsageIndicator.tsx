import React, { useState, useEffect } from 'react';
import { bandwidthOptimizer } from '../../services/BandwidthOptimizer';
import { Icons } from '../Icons';

export const DataUsageIndicator: React.FC = () => {
  const [usage, setUsage] = useState(bandwidthOptimizer.getDataUsage());
  const [isLowBandwidth, setIsLowBandwidth] = useState(bandwidthOptimizer.isLowBandwidthMode());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsage(bandwidthOptimizer.getDataUsage());
      setIsLowBandwidth(bandwidthOptimizer.isLowBandwidthMode());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleLowBandwidth = () => {
    if (isLowBandwidth) {
      bandwidthOptimizer.disableLowBandwidthMode();
    } else {
      bandwidthOptimizer.enableLowBandwidthMode();
    }
    setIsLowBandwidth(!isLowBandwidth);
  };

  const getUsageColor = () => {
    if (usage.usageMB < 30) return 'text-green-600';
    if (usage.usageMB < 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUsageBarColor = () => {
    if (usage.usageMB < 30) return 'bg-green-500';
    if (usage.usageMB < 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-4 z-50">
      {/* Compact indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl border shadow-lg transition-all ${
          isLowBandwidth
            ? 'bg-blue-500/90 border-blue-400 text-white'
            : 'bg-white/90 border-gray-200 text-gray-700'
        }`}
      >
        <Icons.Wifi size={16} />
        <span className={`text-xs font-bold ${getUsageColor()}`}>
          {usage.usageMB.toFixed(1)} MB
        </span>
      </button>

      {/* Detailed panel */}
      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-gray-800">Data Usage</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Icons.X size={16} />
            </button>
          </div>

          {/* Usage stats */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Total Usage</span>
                <span className={`font-bold ${getUsageColor()}`}>
                  {usage.usageMB.toFixed(1)} MB / 50 MB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getUsageBarColor()}`}
                  style={{ width: `${Math.min((usage.usageMB / 50) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-500">Rate</div>
                <div className="font-bold text-gray-800">{usage.rate}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-500">Duration</div>
                <div className="font-bold text-gray-800">
                  {usage.sessionDuration.toFixed(0)} min
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-700">Breakdown</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Videos</span>
                  <span className="font-mono">
                    {(usage.breakdown.videos / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Calls</span>
                  <span className="font-mono">
                    {(usage.breakdown.api / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Images</span>
                  <span className="font-mono">
                    {(usage.breakdown.images / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
              </div>
            </div>

            {/* Low bandwidth toggle */}
            <div className="pt-3 border-t border-gray-200">
              <button
                onClick={toggleLowBandwidth}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  isLowBandwidth
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm font-medium">Low Bandwidth Mode</span>
                <div
                  className={`w-10 h-6 rounded-full transition-all ${
                    isLowBandwidth ? 'bg-blue-300' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      isLowBandwidth ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </button>
              {isLowBandwidth && (
                <p className="text-xs text-gray-500 mt-2">
                  ✓ Videos limited to 360p
                  <br />
                  ✓ Images compressed
                  <br />
                  ✓ Reduced API payloads
                </p>
              )}
            </div>

            {/* Reset button */}
            <button
              onClick={() => {
                bandwidthOptimizer.resetDataUsage();
                setUsage(bandwidthOptimizer.getDataUsage());
              }}
              className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
            >
              Reset Counter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
