import React from 'react';
import { Icons } from '../Icons';

interface GlassPanelProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  isActive?: boolean;
  onMouseDown?: () => void;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ 
  title, 
  icon, 
  onClose, 
  children, 
  headerAction,
  isActive,
  onMouseDown
}) => {
  return (
    <div 
      className={`flex flex-col h-full w-full bg-white/80 backdrop-blur-xl border shadow-2xl rounded-2xl overflow-hidden transition-colors duration-200 ${isActive ? 'border-teal-500/50 shadow-teal-900/10' : 'border-white/40'}`}
      onMouseDown={onMouseDown}
    >
      {/* Header - Draggable Handle */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-100/50 select-none cursor-move ${isActive ? 'bg-teal-50/50' : 'bg-transparent'}`}>
        <div className="flex items-center gap-2 text-gray-700">
          <span className="text-teal-600">{icon}</span>
          <h3 className="font-semibold text-sm tracking-wide uppercase text-gray-600">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {headerAction}
          <button onClick={onClose} className="p-1 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors">
            <Icons.X size={16} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto bg-white/40 p-4 custom-scrollbar cursor-auto">
        {children}
      </div>
    </div>
  );
};