import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../Icons';
import { useAnimation } from '../../src/contexts/AnimationContext';

interface GlassPanelProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  isActive?: boolean;
  onMouseDown?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  loading?: boolean;
  error?: string | null;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ 
  title, 
  icon, 
  onClose, 
  children, 
  headerAction,
  isActive,
  onMouseDown,
  onMaximize,
  isMaximized,
  loading = false,
  error = null
}) => {
  const { shouldAnimate, config } = useAnimation();

  // Animation variants
  const headerButtonVariants = {
    idle: { scale: 1 },
    hover: { scale: shouldAnimate ? 1.1 : 1 },
    tap: { scale: shouldAnimate ? 0.9 : 1 }
  };

  const maximizeVariants = {
    normal: { 
      borderRadius: '1rem',
      transition: { duration: shouldAnimate ? config.duration.normal / 1000 : 0 }
    },
    maximized: { 
      borderRadius: '0rem',
      transition: { duration: shouldAnimate ? config.duration.normal / 1000 : 0 }
    }
  };

  return (
    <motion.div 
      className={`flex flex-col h-full w-full bg-white/80 backdrop-blur-xl border shadow-2xl overflow-hidden transition-all duration-300 ${isActive ? 'border-teal-500/50 shadow-teal-900/10' : 'border-white/40'} ${isMaximized ? 'rounded-none border-0' : 'rounded-2xl'}`}
      onMouseDown={onMouseDown}
      variants={maximizeVariants}
      animate={isMaximized ? 'maximized' : 'normal'}
      role="region"
      aria-label={`${title} panel`}
      aria-busy={loading}
    >
      {/* Header - Draggable Handle */}
      <div 
        className={`flex items-center justify-between px-4 py-3 border-b border-gray-100/50 select-none cursor-move ${isActive ? 'bg-teal-50/50' : 'bg-transparent'}`}
        role="banner"
        aria-label={`${title} panel header`}
      >
        <div className="flex items-center gap-2 text-gray-700">
          <span className="text-teal-600" aria-hidden="true">{icon}</span>
          <h3 className="font-semibold text-sm tracking-wide uppercase text-gray-600">{title}</h3>
        </div>
        <div className="flex items-center gap-1" role="toolbar" aria-label="Panel controls">
          {headerAction}
          
          {onMaximize && (
            <motion.button 
              onClick={(e) => { e.stopPropagation(); onMaximize(); }} 
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
              title={isMaximized ? "Restore panel" : "Maximize panel"}
              aria-label={isMaximized ? "Restore panel" : "Maximize panel"}
              aria-pressed={isMaximized}
              variants={headerButtonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
            >
              {isMaximized ? <Icons.Minimize size={16} /> : <Icons.Maximize size={16} />}
            </motion.button>
          )}

          <motion.button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-md transition-colors"
            title="Close panel"
            aria-label={`Close ${title} panel`}
            variants={headerButtonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
          >
            <Icons.X size={16} />
          </motion.button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto bg-white/40 p-4 custom-scrollbar cursor-auto">
        {error ? (
          <div 
            className="flex items-center justify-center h-full"
            role="alert"
            aria-live="assertive"
          >
            <div className="text-center">
              <div className="text-red-500 mb-2" aria-hidden="true">
                <Icons.AlertCircle size={48} />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div 
            className="flex items-center justify-center h-full"
            role="status"
            aria-live="polite"
            aria-label="Loading content"
          >
            <div className="text-center">
              <div className="animate-spin text-teal-500 mb-2" aria-hidden="true">
                <Icons.Loader size={48} />
              </div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
};