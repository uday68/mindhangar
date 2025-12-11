import React from 'react';
import { useStore } from '../../store/useStore';
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
    <div className={`h-screen w-24 bg-white/40 backdrop-blur-2xl border-r border-white/30 flex flex-col items-center py-8 gap-4 z-50 transition-all duration-700 shadow-[5px_0_30px_rgba(0,0,0,0.02)] ${isFocusMode ? '-translate-x-full opacity-0' : 'translate-x-0'}`}>
      
      {/* Brand / Logo Area */}
      <div className="mb-4 relative group cursor-pointer">
        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
        <div className="relative w-12 h-12 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl border border-white/10 overflow-hidden">
          <span className="bg-gradient-to-br from-teal-200 to-indigo-200 bg-clip-text text-transparent">M</span>
          {/* Shine effect */}
          <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shine" />
        </div>
      </div>
      
      {/* Divider */}
      <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50"></div>

      {/* Main Nav */}
      <div className="flex-1 flex flex-col gap-4 w-full items-center">
        <NavItem id="search" icon={Icons.Search} label="Search" />
        <NavItem id="planner" icon={Icons.Calendar} label="Planner" />
        <NavItem id="notes" icon={Icons.FileText} label="Notes" />
        <NavItem id="video" icon={Icons.Video} label="Video Studio" />
        <NavItem id="quiz" icon={Icons.Brain} label="Quiz" />
        <NavItem id="focus" icon={Icons.Eye} label="Focus" />
      </div>

      {/* Bottom Nav */}
      <div className="mt-auto flex flex-col gap-4 items-center w-full">
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
        
        {/* User Profile & Gamification Stats */}
        <div 
          className="mt-2 flex flex-col items-center gap-1 group relative cursor-pointer"
          onClick={() => togglePanel('settings')}
        >
          {/* Avatar Container with Animated Glow Ring */}
          <div className="relative w-12 h-12 flex items-center justify-center">
             {/* Spinning Border */}
             <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-lg" viewBox="0 0 36 36">
               <path className="text-slate-200/50" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
               <path 
                 className="text-indigo-500 transition-all duration-1000 ease-out" 
                 strokeDasharray={`${xpProgress}, 100`} 
                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                 fill="none" 
                 stroke="currentColor" 
                 strokeWidth="2.5" 
                 strokeLinecap="round"
               />
             </svg>
             
             {/* Avatar Image - Dynamic */}
             <div className="w-9 h-9 rounded-full overflow-hidden border border-white shadow-inner bg-slate-100">
               {user?.avatar ? (
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-600 font-bold">{user?.name?.[0] || 'U'}</div>
               )}
             </div>
             
             {/* Pro Badge */}
             {user?.isPro && (
                <div className="absolute -top-1 -right-1 bg-indigo-600 text-[8px] text-white font-bold px-1.5 py-0.5 rounded border border-white">PRO</div>
             )}
          </div>
          
          {/* Level Badge Pill */}
          <div className="absolute -bottom-2 bg-slate-800/90 backdrop-blur text-[8px] text-teal-300 font-bold px-2 py-0.5 rounded-full border border-white/10 shadow-lg tracking-widest">
            LVL {userStats.level}
          </div>

          {/* Stats Tooltip (Futuristic Card) */}
          <div className="absolute left-16 bottom-0 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-50">
             <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
               <h4 className="font-bold text-white text-xs tracking-wider uppercase">Student ID</h4>
               <span className="text-[10px] text-teal-400 font-mono">#{user?.id?.substring(0,6) || '8492'}</span>
             </div>
             
             <div className="space-y-3">
                <div className="flex justify-between items-end text-slate-400 text-xs">
                   <span>XP Progress</span>
                   <span className="font-mono font-bold text-white">{userStats.xp} <span className="text-[9px] text-slate-500">/ 1000</span></span>
                </div>
                {/* Progress Bar with Glow */}
                <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden shadow-inner">
                   <div className="bg-gradient-to-r from-teal-500 to-indigo-500 h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${xpProgress}%` }}></div>
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                   <div className="flex-1 bg-white/5 rounded-lg p-2 text-center border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase">Streak</div>
                      <div className="text-sm font-bold text-orange-400">🔥 {userStats.streak}</div>
                   </div>
                   <div className="flex-1 bg-white/5 rounded-lg p-2 text-center border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase">Focus</div>
                      <div className="text-sm font-bold text-teal-400">85%</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};