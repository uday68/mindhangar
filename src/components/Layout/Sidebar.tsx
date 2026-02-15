import React from 'react';
import { useStore } from '../../../store/useStore';
import { Icons } from '../Icons';
import { PanelType } from '../../types';

export const Sidebar: React.FC = () => {
  const { activePanels, togglePanel, isFocusMode, userStats, notifications, user, toggleUpgradeModal } = useStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  const NavItem = ({ id, icon: Icon, label, badge }: { id: PanelType, icon: any, label: string, badge?: number }) => {
    const isActive = activePanels[id].isOpen;
    
    return (
      <button 
        onClick={() => togglePanel(id)}
        disabled={isFocusMode}
        className={`relative group w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 ease-out
          ${isFocusMode ? 'opacity-30 cursor-not-allowed grayscale' : ''}
          ${isActive 
            ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] scale-105' 
            : 'text-slate-400 hover:text-teal-500 hover:bg-white/50 hover:shadow-lg hover:shadow-teal-900/5'
          }
        `}
        title={label}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'rotate-0' : 'group-hover:scale-110'}`} />
        
        {/* Futuristic Active Indicator (Dot) */}
        {isActive && !isFocusMode && (
           <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-teal-400 rounded-full blur-[2px]" />
        )}

        {/* Badge */}
        {badge && badge > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 border border-white">
            {badge > 9 ? '9+' : badge}
          </div>
        )}
        
        {/* Tooltip - Floating glass pill */}
        {!isFocusMode && (
          <span className="absolute left-16 px-3 py-1.5 bg-slate-800/90 backdrop-blur text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl">
            {label}
            {/* Tiny arrow */}
            <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800/90 rotate-45 -z-10"></span>
          </span>
        )}
      </button>
    );
  };

  const xpProgress = (userStats.xp % 100); // 0 to 99

  return (
    <div className={`h-full w-24 bg-white/40 backdrop-blur-2xl border-r border-white/30 flex flex-col items-center py-6 gap-4 z-50 transition-all duration-700 shadow-[5px_0_30px_rgba(0,0,0,0.02)] ${isFocusMode ? '-translate-x-full opacity-0' : 'translate-x-0'}`}>
      
      {/* Main Nav */}
      <div className="flex-1 flex flex-col gap-4 w-full items-center pt-4">
        <NavItem id="search" icon={Icons.Search} label="Search" />
        <NavItem id="courses" icon={Icons.BookOpen} label="My Courses" />
        <NavItem id="planner" icon={Icons.Calendar} label="Planner" />
        <NavItem id="notes" icon={Icons.FileText} label="Notes" />
        <NavItem id="video" icon={Icons.Video} label="Video Studio" />
        <NavItem id="quiz" icon={Icons.Brain} label="Quiz" />
        <NavItem id="focus" icon={Icons.Eye} label="Focus" />
      </div>

      {/* Bottom Nav */}
      <div className="mt-auto flex flex-col gap-4 items-center w-full pb-4">
        {/* Upgrade Button (Visible if not Pro) */}
        {user && !user.isPro && (
          <button 
            onClick={toggleUpgradeModal}
            className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-300 hover:scale-110 transition-transform animate-pulse"
            title="Upgrade to Pro"
          >
            <Icons.Sparkles size={16} />
          </button>
        )}

        <NavItem id="chat" icon={Icons.MessageCircle} label="AI Assistant" />
        <NavItem id="notifications" icon={Icons.Bell} label="Notifications" badge={unreadCount} />
        <NavItem id="settings" icon={Icons.Settings} label="Settings" />
      </div>
    </div>
  );
};