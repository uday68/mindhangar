import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Icons } from '../Icons';
import { PanelType, CommandAction } from '../../types';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    togglePanel, 
    resetLayout,
    startSession,
    user,
    logout
  } = useStore();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Define Commands
  const commands: CommandAction[] = [
    // Navigation
    { id: 'nav-notes', label: 'Open Notes', icon: Icons.FileText, group: 'navigation', perform: () => togglePanel('notes') },
    { id: 'nav-video', label: 'Open Video Studio', icon: Icons.Video, group: 'navigation', perform: () => togglePanel('video') },
    { id: 'nav-chat', label: 'Open AI Coach', icon: Icons.MessageCircle, group: 'navigation', perform: () => togglePanel('chat') },
    { id: 'nav-planner', label: 'Open Planner', icon: Icons.Calendar, group: 'navigation', perform: () => togglePanel('planner') },
    { id: 'nav-settings', label: 'Settings', icon: Icons.Settings, group: 'navigation', perform: () => togglePanel('settings') },
    
    // Actions
    { id: 'act-focus', label: 'Start 25m Focus Session', icon: Icons.Target, shortcut: ['F'], group: 'action', perform: () => startSession('focus', 25*60) },
    { id: 'act-break', label: 'Take 5m Break', icon: Icons.Eye, group: 'action', perform: () => startSession('break', 5*60) },
    { id: 'act-layout', label: 'Reset Layout (Studio)', icon: Icons.LayoutGrid, group: 'action', perform: () => resetLayout('Studio') },
    { id: 'act-logout', label: 'Log Out', icon: Icons.ExternalLink, group: 'action', perform: () => logout() },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].perform();
        setCommandPaletteOpen(false);
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setCommandPaletteOpen(false)}>
      <div 
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-gray-100">
          <Icons.Search className="text-gray-400" size={20} />
          <input 
            ref={inputRef}
            type="text" 
            className="w-full py-4 px-4 text-lg text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
            placeholder="What do you need?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-1">
             <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">ESC</span>
          </div>
        </div>
        
        <div ref={listRef} className="max-h-[300px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No commands found.</div>
          ) : (
            <>
              {filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon || Icons.Check;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.perform(); setCommandPaletteOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${isSelected ? 'bg-teal-50 text-teal-900 border-l-4 border-teal-500 pl-3' : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'}`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isSelected ? 'text-teal-600' : 'text-gray-400'} />
                      <span className={`text-sm ${isSelected ? 'font-semibold' : 'font-medium'}`}>{cmd.label}</span>
                    </div>
                    {cmd.shortcut && (
                      <div className="flex gap-1">
                        {cmd.shortcut.map(key => (
                          <span key={key} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-500 shadow-sm">{key}</span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>
        
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center">
           <div className="flex gap-4">
              <span className="text-[10px] text-gray-500"><strong>↑↓</strong> to navigate</span>
              <span className="text-[10px] text-gray-500"><strong>↵</strong> to select</span>
           </div>
           {user?.isPro && (
             <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
               <Icons.Sparkles size={10} /> PRO Active
             </span>
           )}
        </div>
      </div>
    </div>
  );
};
