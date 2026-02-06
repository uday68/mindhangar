import React, { useState, useEffect } from 'react';
import { offlineSyncService } from '../../src/services/OfflineSyncService';
import { Icons } from '../Icons';

export const OfflineIndicator: React.FC = () => {
  const [status, setStatus] = useState(offlineSyncService.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(offlineSyncService.getStatus());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (status.isOnline && status.pendingSync === 0) {
    return null; // Don't show when online and synced
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border shadow-lg ${
          status.isOnline
            ? 'bg-green-500/90 border-green-400 text-white'
            : 'bg-orange-500/90 border-orange-400 text-white'
        }`}
      >
        {status.isOnline ? (
          <>
            <Icons.Wifi size={16} />
            <span className="text-sm font-medium">
              Syncing {status.pendingSync} items...
            </span>
          </>
        ) : (
          <>
            <Icons.WifiOff size={16} />
            <span className="text-sm font-medium">
              Offline Mode • {status.pendingSync} items pending
            </span>
          </>
        )}
      </div>
    </div>
  );
};
