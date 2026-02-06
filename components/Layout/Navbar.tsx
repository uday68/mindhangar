import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Icons } from '../Icons';
import { LanguageSelector } from '../../src/components/LanguageSelector';

export const Navbar: React.FC = () => {
  const { user, userStats, logout } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleReset = () => {
    if (confirm('🔄 Reset to Default Layout?\n\nThis will:\n• Clear all saved layouts\n• Reset panel positions\n• Clear preferences\n• Reload the page\n\nYou will need to login again. Continue?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const xpProgress = (userStats.xp % 100);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-[100] shadow-sm">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">M</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-none">MindHangar</h1>
              <p className="text-[10px] text-gray-500 leading-none">AI for Bharat</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200"></div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-indigo-50 rounded-lg border border-teal-100">
              <Icons.Target size={14} className="text-teal-600" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase font-bold leading-none">Level</span>
                <span className="text-sm font-bold text-gray-800 leading-none">{userStats.level}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
              <span className="text-base">🔥</span>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase font-bold leading-none">Streak</span>
                <span className="text-sm font-bold text-gray-800 leading-none">{userStats.streak} days</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <Icons.Sparkles size={14} className="text-purple-600" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase font-bold leading-none">XP</span>
                <span className="text-sm font-bold text-gray-800 leading-none">{userStats.xp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <LanguageSelector compact={true} className="hidden md:block" />

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all group"
            title="Reset to default layout"
          >
            <Icons.RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {/* Avatar with XP Ring */}
              <div className="relative w-8 h-8">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                  <circle 
                    cx="18" cy="18" r="16" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="2" 
                    strokeDasharray={`${xpProgress}, 100`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-1 rounded-full overflow-hidden bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-teal-700">{user?.name?.[0] || 'U'}</span>
                  )}
                </div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800 leading-none">{user?.name || 'Student'}</p>
                <p className="text-[10px] text-gray-500 leading-none">Level {userStats.level} Scholar</p>
              </div>
              <Icons.ChevronDown size={16} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-[90]" 
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{user?.name || 'Student'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'student@mindhangar.com'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${xpProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">{xpProgress}%</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                    <Icons.Settings size={16} className="text-gray-400" />
                    Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                    <Icons.Bell size={16} className="text-gray-400" />
                    Notifications
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                    <Icons.TrendingUp size={16} className="text-gray-400" />
                    Progress
                  </button>

                  <div className="border-t border-gray-100 my-2"></div>

                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <Icons.X size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
