import React, { useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useStore } from '../../store/useStore';
import { PanelType, PanelState } from '../../types';
import { GlassPanel } from '../Shared/GlassPanel';
import { Icons } from '../Icons';

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

  return (
    <div className="flex-1 relative h-screen w-full overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-gray-100 to-teal-50">
      {/* Background decoration - Clean Grid */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }}>
      </div>

      {/* Focus Mode Backdrop */}
      {isFocusMode && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-40 flex items-center justify-center transition-all duration-500">
          <div className="absolute top-8 text-center animate-pulse">
            <h1 className="text-2xl font-bold text-gray-800 tracking-widest uppercase">Deep Focus Active</h1>
            <p className="text-sm text-gray-500">Distractions are blocked</p>
          </div>
        </div>
      )}

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
          <Rnd
            key={key}
            // If maximized, we use size 100% via style (handled by Rnd className usually, but explicit size works)
            // For Rnd, setting size/position to undefined or specific values toggles control.
            // We use explicit values here.
            size={isMaximized ? { width: '100%', height: '100%' } : size}
            position={isMaximized ? { x: 0, y: 0 } : position}
            disableDragging={disableDrag}
            enableResizing={disableResize}
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
              transition: (isLocked || isMaximized) ? 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none'
            }}
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
        );
      })}
    </div>
  );
};