import React from 'react';
import { useStore } from '@/store/useStore';
import { Icons } from '../Icons';

export const NotificationPanel: React.FC = () => {
  const { notifications, markRead, clearNotifications } = useStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <div className="p-1.5 rounded-full bg-green-100 text-green-600"><Icons.Check size={14} /></div>;
      case 'alert': return <div className="p-1.5 rounded-full bg-red-100 text-red-600"><Icons.Bell size={14} /></div>;
      default: return <div className="p-1.5 rounded-full bg-blue-100 text-blue-600"><Icons.MessageCircle size={14} /></div>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Activity</span>
        {notifications.length > 0 && (
          <button onClick={clearNotifications} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center">
            <Icons.Bell className="mb-2 opacity-30" size={32} />
            <p className="text-sm">All caught up!</p>
          </div>
        )}

        {notifications.map((n) => (
          <div 
            key={n.id} 
            onClick={() => markRead(n.id)}
            className={`flex gap-3 p-3 rounded-xl border transition-all cursor-pointer ${n.read ? 'bg-white/40 border-transparent opacity-60' : 'bg-white border-white shadow-sm hover:shadow-md'}`}
          >
            <div className="shrink-0 mt-0.5">{getIcon(n.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className={`text-sm ${n.read ? 'font-medium text-gray-600' : 'font-bold text-gray-800'}`}>{n.title}</h4>
                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
};