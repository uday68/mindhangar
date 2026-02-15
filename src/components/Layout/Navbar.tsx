import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { Icons } from '../Icons';
import { LanguageSelector } from '../LanguageSelector';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useAnimation } from '../../contexts/AnimationContext';

export const Navbar: React.FC = () => {
  const { user, userStats, logout } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  
  const { announceToScreenReader, registerLandmark } = useAccessibility();
  const { shouldAnimate, config } = useAnimation();

  
  // Register navbar as landmark for accessibility
  useEffect(() => {
    registerLandmark('navbar', 'Main navigation bar');
  }, [registerLandmark]);

  // Handle keyboard navigation for user menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showUserMenu) {
        if (e.key === 'Escape') {
          setShowUserMenu(false);
          userButtonRef.current?.focus();
          announceToScreenReader('User menu closed', 'polite');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showUserMenu, announceToScreenReader]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showUserMenu &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        !userButtonRef.current?.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleReset = () => {
    if (confirm('🔄 Reset to Default Layout?\n\nThis will:\n• Clear all saved layouts\n• Reset panel positions\n• Clear preferences\n• Reload the page\n\nYou will need to login again. Continue?')) {
      announceToScreenReader('Resetting application to default layout', 'assertive');
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleUserMenuToggle = () => {
    const newState = !showUserMenu;
    setShowUserMenu(newState);
    announceToScreenReader(
      newState ? 'User menu opened' : 'User menu closed',
      'polite'
    );
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    announceToScreenReader('Logging out', 'polite');
    logout();
  };

  const xpProgress = (userStats.xp % 100);

  // Animation variants
  const menuVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      scale: 0.95,
      transition: { duration: config.duration.fast / 1000 }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { duration: config.duration.normal / 1000 }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      scale: 0.95,
      transition: { duration: config.duration.fast / 1000 }
    }
  };

  const statVariants = {
    hover: shouldAnimate ? { scale: 1.05, y: -2 } : {},
    tap: shouldAnimate ? { scale: 0.95 } : {}
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-[100] shadow-sm"
      role="navigation"
      aria-label="Main navigation"
      id="navbar"
    >
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-4">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={shouldAnimate ? { scale: 1.02 } : {}}
            transition={{ duration: config.duration.fast / 1000 }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white" aria-hidden="true">M</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-none">MindHangar</h1>
              <p className="text-[10px] text-gray-500 leading-none">AI for Bharat</p>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200" aria-hidden="true"></div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4" role="status" aria-live="polite" aria-label="User statistics">
            <motion.div 
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-indigo-50 rounded-lg border border-teal-100"
              variants={statVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label={`Level ${userStats.level}`}
            >
              <Icons.Target size={14} className="text-teal-600" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase font-bold leading-none">Level</span>
                <span className="text-sm font-bold text-gray-800 leading-none">{userStats.level}</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100"
              variants={statVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label={`${userStats.streak} day streak`}
            >
              <span className="text-base" aria-hidden="true">🔥</span>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase font-bold leading-none">Streak</span>
                <span className="text-sm font-bold text-gray-800 leading-none">{userStats.streak} days</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100"
              variants={statVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label={`${userStats.xp} experience points`}
            >
              <Icons.Sparkles size={14} className="text-purple-600" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase font-bold leading-none">XP</span>
                <span className="text-sm font-bold text-gray-800 leading-none">{userStats.xp}</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="hidden md:block">
            <LanguageSelector compact={true} />
          </div>

          {/* Reset Button */}
          <motion.button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all group min-h-[44px]"
            title="Reset to default layout"
            aria-label="Reset application to default layout"
            whileHover={shouldAnimate ? { scale: 1.05 } : {}}
            whileTap={shouldAnimate ? { scale: 0.95 } : {}}
          >
            <motion.div
              animate={shouldAnimate ? { rotate: 0 } : {}}
              whileHover={shouldAnimate ? { rotate: 180 } : {}}
              transition={{ duration: 0.5 }}
            >
              <Icons.RotateCcw size={16} />
            </motion.div>
            <span className="hidden md:inline">Reset</span>
          </motion.button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              ref={userButtonRef}
              onClick={handleUserMenuToggle}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]"
              aria-label={`User menu for ${user?.name || 'Student'}`}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              whileHover={shouldAnimate ? { scale: 1.02 } : {}}
              whileTap={shouldAnimate ? { scale: 0.98 } : {}}
            >
              {/* Avatar with XP Ring */}
              <div className="relative w-8 h-8">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
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
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-teal-700">{user?.name?.[0] || 'U'}</span>
                  )}
                </div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800 leading-none">{user?.name || 'Student'}</p>
                <p className="text-[10px] text-gray-500 leading-none">Level {userStats.level} Scholar</p>
              </div>
              <motion.div
                animate={shouldAnimate ? { rotate: showUserMenu ? 180 : 0 } : {}}
                transition={{ duration: config.duration.fast / 1000 }}
              >
                <Icons.ChevronDown size={16} className="text-gray-400" aria-hidden="true" />
              </motion.div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[90]" 
                    onClick={() => setShowUserMenu(false)}
                    aria-hidden="true"
                  ></div>
                  <motion.div 
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[100]"
                    role="menu"
                    aria-label="User menu"
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100" role="presentation">
                      <p className="text-sm font-bold text-gray-800">{user?.name || 'Student'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'student@mindhangar.com'}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5" role="progressbar" aria-valuenow={xpProgress} aria-valuemin={0} aria-valuemax={100} aria-label="Experience progress">
                          <motion.div 
                            className="bg-gradient-to-r from-teal-500 to-indigo-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          ></motion.div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-600">{xpProgress}%</span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <motion.button 
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors min-h-[44px]"
                      role="menuitem"
                      whileHover={shouldAnimate ? { x: 4 } : {}}
                    >
                      <Icons.Settings size={16} className="text-gray-400" aria-hidden="true" />
                      Settings
                    </motion.button>
                    <motion.button 
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors min-h-[44px]"
                      role="menuitem"
                      whileHover={shouldAnimate ? { x: 4 } : {}}
                    >
                      <Icons.Bell size={16} className="text-gray-400" aria-hidden="true" />
                      Notifications
                    </motion.button>
                    <motion.button 
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors min-h-[44px]"
                      role="menuitem"
                      whileHover={shouldAnimate ? { x: 4 } : {}}
                    >
                      <Icons.TrendingUp size={16} className="text-gray-400" aria-hidden="true" />
                      Progress
                    </motion.button>

                    <div className="border-t border-gray-100 my-2" role="separator"></div>

                    <motion.button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors min-h-[44px]"
                      role="menuitem"
                      whileHover={shouldAnimate ? { x: 4 } : {}}
                    >
                      <Icons.X size={16} aria-hidden="true" />
                      Logout
                    </motion.button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};
