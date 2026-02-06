import React from 'react';
import { useStore } from '../../store/useStore';
import { Icons } from '../Icons';
import { PanelType } from '../../types';

export const MobileNav: React.FC = () => {
  const { activePanels, togglePanel, isFocusMode, notifications } = useStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems: Array<{
    id: PanelType;
    icon: any;
    label: string;
    badge?: number;
  }> = [
    { id: 'planner', icon: Icons.Calendar, label: 'Plan' },
    { id: 'notes', icon: Icons.FileText, label: 'Notes' },
    { id: 'video', icon: Icons.Video, label: 'Video' },
    { id: 'quiz', icon: Icons.Brain, label: 'Quiz' },
    { id: 'chat', icon: Icons.MessageCircle, label: 'AI' },
  ];

  if (isFocusMode) {
    return null; // Hide nav during focus mode
  }

  return (
    <nav className="mobile-nav md:hidden">
      {navItems.map(({ id, icon: Icon, label, badge }) => {
        const isActive = activePanels[id].isOpen;
        
        return (
          <button
            key={id}
            onClick={() => togglePanel(id)}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="mobile-nav-label">{label}</span>
            {badge && badge > 0 && (
              <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {badge > 9 ? '9+' : badge}
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
};
