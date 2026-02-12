import React, { useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { PanelType, PanelState } from '../../types';
import { GlassPanel } from '../Shared/GlassPanel';
import { Icons } from '../Icons';
import { useAccessibility } from '../../src/contexts/AccessibilityContext';
import { useAnimation } from '../../src/contexts/AnimationContext';

// Panels
import { SearchPanel } from '../Panels/SearchPanel';
import { PlannerPanel } from '../Panels/PlannerPanel';
import { NotesPanel } from '../Panels/NotesPanel';
import { ChatPanel } from '../Panels/ChatPanel';
import { QuizPanel } from '../Panels/QuizPanel';
import { VideoPanel } from '../Panels/VideoPanel';
import { FocusPanel } from '../Panels/FocusPanel';
import { NotificationPanel } from '../Panels/NotificationPanel';
import { SettingsPanel } from '../Panels/SettingsPanel';
// AI Panels
import { DashboardPanel } from '../Panels/DashboardPanel';
import { AnalyticsPanel } from '../Panels/AnalyticsPanel';
import { ProgressPanel } from '../Panels/ProgressPanel';
import { PredictionsPanel } from '../Panels/PredictionsPanel';
// Developer Tools
import { DeveloperToolsPanel } from '../Panels/DeveloperToolsPanel';

const PanelContentMap: Record<PanelType, React.FC> = {
  search: SearchPanel,
  planner: PlannerPanel,
  notes: NotesPanel,
  video: VideoPanel,
  quiz: QuizPanel,
  focus: FocusPanel,
  chat: ChatPanel,
  notifications: NotificationPanel,
  settings: SettingsPanel,
  dashboard: DashboardPanel,
  analytics: AnalyticsPanel,
  progress: ProgressPanel,
  predictions: PredictionsPanel,
  devtools: DeveloperToolsPanel,
};

const PanelIconMap: Record<PanelType, any> = {
  search: <Icons.Search size={18} />,
  planner: <Icons.Calendar size={18} />,
  notes: <Icons.FileText size={18} />,
  video: <Icons.Video size={18} />,
  quiz: <Icons.Brain size={18} />,
  focus: <Icons.Eye size={18} />,
  chat: <Icons.MessageCircle size={18} />,
  notifications: <Icons.Bell size={18} />,
  settings: <Icons.Settings size={18} />,
  dashboard: <Icons.LayoutDashboard size={18} />,
  analytics: <Icons.BarChart size={18} />,
  progress: <Icons.TrendingUp size={18} />,
  predictions: <Icons.Zap size={18} />,
  devtools: <Icons.Code size={18} />,
};

const PanelTitleMap: Record<PanelType, string> = {
  search: "Deep Search",
  planner: "Study Planner",
  notes: "Smart Notes",
  video: "Video Studio",
  quiz: "Quiz Generator",
  focus: "Focus Monitor",
  chat: "AI Coach",
  notifications: "Notifications",
  settings: "Settings",
  dashboard: "AI Dashboard",
  analytics: "Learning Analytics",
  progress: "My Progress",
  predictions: "Performance Insights",
  devtools: "Developer Tools",
};

export const Workspace: React.FC = () => {
  const { 
    activePanels, 
    togglePanel, 
    updatePanelPosition, 
    bringToFront, 
    focusedPanel, 
    isFocusMode, 
    focusSession, 
    tickSession,
    maximizedPanel,
    toggleMaximize 
  } = useStore();

  const { announceToScreenReader, registerLandmark } = useAccessibility();
  const { shouldAnimate, config, getVariant } = useAnimation();

  // Global Timer Driver
  useEffect(() => {
    let interval: number | null = null;
    if (focusSession.isActive) {
      interval = window.setInterval(() => {
        tickSession();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusSession.isActive, tickSession]);

  // Register workspace as landmark for screen readers
  useEffect(() => {
    registerLandmark('workspace', 'Application workspace');
  }, [registerLandmark]);

  // Announce focus mode changes
  useEffect(() => {
    if (isFocusMode) {
      announceToScreenReader('Deep Focus mode activated. Distractions are blocked.', 'polite');
    } else {
      announceToScreenReader('Deep Focus mode deactivated.', 'polite');
    }
  }, [isFocusMode, announceToScreenReader]);

  // Animation variants
  const pageTransitionVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: shouldAnimate ? config.duration.normal / 1000 : 0,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: {
        duration: shouldAnimate ? config.duration.fast / 1000 : 0
      }
    }
  };

  const panelEntranceVariants = {
    initial: { opacity: 0, y: 20, scale: 0.9 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: shouldAnimate ? config.duration.normal / 1000 : 0,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.9,
      transition: {
        duration: shouldAnimate ? config.duration.fast / 1000 : 0
      }
    }
  };

  const focusModeBackdropVariants = {
    initial: { opacity: 0, backdropFilter: 'blur(0px)' },
    animate: { 
      opacity: 1, 
      backdropFilter: 'blur(12px)',
      transition: {
        duration: shouldAnimate ? config.duration.slow / 1000 : 0
      }
    },
    exit: { 
      opacity: 0, 
      backdropFilter: 'blur(0px)',
      transition: {
        duration: shouldAnimate ? config.duration.normal / 1000 : 0
      }
    }
  };

  return (
    <motion.div 
      className="flex-1 relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-gray-100 to-teal-50 workspace-container"
      role="main"
      aria-label="Application workspace"
      id="workspace"
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Background decoration - Clean Grid */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none background-decoration" 
           style={{ 
             backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }}
           aria-hidden="true">
      </div>

      {/* Focus Mode Backdrop */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div 
            className="absolute inset-0 bg-white/90 backdrop-blur-md z-40 flex items-center justify-center"
            variants={focusModeBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="alert"
            aria-live="assertive"
          >
            <motion.div 
              className="absolute top-8 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.2, duration: shouldAnimate ? 0.3 : 0 }
              }}
            >
              <h1 className="text-2xl font-bold text-gray-800 tracking-widest uppercase">Deep Focus Active</h1>
              <p className="text-sm text-gray-500">Distractions are blocked</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        {(Object.entries(activePanels) as [string, PanelState][]).map(([key, panel]) => {
          const type = key as PanelType;

          if (isFocusMode) {
            // In "Deep Focus" mode (UI Lock), we allow Focus panel AND Video panel (so they can study with video)
            if (type !== 'focus' && type !== 'video') return null;
          } else {
            if (!panel.isOpen) return null;
          }
          
          const Content = PanelContentMap[type];

          // Layout overrides for Focus Mode
          const isLocked = isFocusMode && type === 'focus';
          
          // Check Maximized State
          const isMaximized = maximizedPanel === type;

          // Determine Position & Size
          let position = { x: panel.x, y: panel.y };
          let size = { width: panel.width, height: panel.height };
          
          if (isLocked) {
            position = { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 200 };
            size = { width: 400, height: 400 };
          } else if (isMaximized) {
            position = { x: 0, y: 0 };
            // We'll set size to 100% via Rnd props or styling, but Rnd expects explicit values for controlled mode.
            // Using '100%' in style often works better for Rnd when maximizing.
          }

          const disableDrag = isLocked || isMaximized;
          const disableResize = isLocked || isMaximized;

          return (
            <motion.div
              key={key}
              variants={panelEntranceVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            >
              <Rnd
                // If maximized, we use size 100% via style (handled by Rnd className usually, but explicit size works)
                // For Rnd, setting size/position to undefined or specific values toggles control.
                // We use explicit values here.
                size={isMaximized ? { width: '100%', height: '100%' } : size}
                position={isMaximized ? { x: 0, y: 0 } : position}
                disableDragging={disableDrag}
                enableResizing={!disableResize}
                onDragStop={(e, d) => !disableDrag && updatePanelPosition(type, { x: d.x, y: d.y })}
                onResizeStop={(e, direction, ref, delta, position) => {
                  !disableDrag && updatePanelPosition(type, {
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    ...position,
                  });
                }}
                onMouseDown={() => !isLocked && bringToFront(type)}
                style={{ 
                  zIndex: isLocked ? 50 : (isMaximized ? 9999 : panel.zIndex),
                  transition: (isLocked || isMaximized) ? (shouldAnimate ? 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none') : 'none'
                }}
                className={`panel-container ${isMaximized ? 'panel-maximized' : ''}`}
                bounds="parent"
                minWidth={320}
                minHeight={250}
                dragHandleClassName={disableDrag ? "" : "cursor-move"}
              >
                <GlassPanel
                  title={PanelTitleMap[type]}
                  icon={PanelIconMap[type]}
                  onClose={() => !isLocked && togglePanel(type)}
                  isActive={focusedPanel === type || isLocked || isMaximized}
                  onMouseDown={() => !isLocked && bringToFront(type)}
                  onMaximize={!isLocked ? () => toggleMaximize(type) : undefined}
                  isMaximized={isMaximized}
                >
                  <Content />
                </GlassPanel>
              </Rnd>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};