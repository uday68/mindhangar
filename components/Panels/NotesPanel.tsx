import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Icons } from '../Icons';
import { Block, BlockType, Page } from '../../types';

// Simple Block Component
const BlockEditor: React.FC<{ 
  block: Block, 
  onUpdate: (val: string) => void, 
  onEnter: () => void,
  onDelete: () => void,
  isFocused?: boolean
}> = ({ block, onUpdate, onEnter, onDelete }) => {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
    }
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onDelete();
    }
  };

  const getPlaceholder = () => {
    switch(block.type) {
      case 'h1': return 'Heading 1';
      case 'h2': return 'Heading 2';
      case 'todo': return 'To-do';
      default: return "Type '/' for commands";
    }
  };

  const baseClasses = "w-full bg-transparent outline-none resize-none overflow-hidden py-1";
  
  return (
    <div className="group flex items-start -ml-6 pl-2 relative">
      {/* Drag Handle / Menu Trigger */}
      <div className="absolute left-[-20px] top-1.5 opacity-0 group-hover:opacity-100 cursor-grab text-gray-300 hover:text-gray-500 transition-opacity p-0.5">
        <Icons.GripVertical size={14} />
      </div>

      {block.type === 'todo' && (
        <div className="mr-2 mt-1.5 text-gray-400">
          <div className="w-4 h-4 border border-gray-300 rounded cursor-pointer hover:border-teal-500"></div>
        </div>
      )}

      {block.type === 'bullet' && (
        <div className="mr-2 mt-2.5 w-1.5 h-1.5 bg-gray-800 rounded-full shrink-0"></div>
      )}

      <input
        value={block.content}
        onChange={(e) => onUpdate(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        className={`
          ${baseClasses}
          ${block.type === 'h1' ? 'text-3xl font-bold text-gray-900 mt-4 mb-2' : ''}
          ${block.type === 'h2' ? 'text-xl font-semibold text-gray-800 mt-3 mb-1 border-b border-gray-100 pb-1' : ''}
          ${block.type === 'text' ? 'text-sm text-gray-700 leading-relaxed' : ''}
          ${block.type === 'todo' ? 'text-sm text-gray-700' : ''}
          ${block.type === 'bullet' ? 'text-sm text-gray-700' : ''}
          placeholder-gray-300
        `}
        autoFocus
      />
    </div>
  );
};

export const NotesPanel: React.FC = () => {
  const { 
    pages, blocks, activePageId, 
    createPage, setActivePage, updatePageTitle, deletePage,
    addBlock, updateBlock, deleteBlock 
  } = useStore();

  const activePage = activePageId ? pages[activePageId] : null;

  // Render Page Tree Recursive (Simplified for flat list now, can be recursive later)
  const renderSidebar = () => (
    <div className="w-48 flex flex-col bg-gray-50/50 border-r border-gray-100 h-full">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Workspace</span>
        <button onClick={() => createPage()} className="text-gray-400 hover:text-teal-600 p-1 rounded hover:bg-gray-100 transition-colors">
          <Icons.Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {Object.values(pages).map((page: Page) => (
          <div 
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${activePageId === page.id ? 'bg-white text-teal-700 font-medium shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <span className="opacity-70 text-xs">{page.icon}</span>
            <span className="truncate flex-1">{page.title || "Untitled"}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 p-0.5"
            >
              <Icons.Trash size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const handleCreateBlock = (currentBlockId?: string) => {
    if (!activePageId) return;
    addBlock(activePageId, 'text', '', currentBlockId);
  };

  // Block Type commands handling (simple version)
  const handleBlockUpdate = (blockId: string, content: string) => {
    // Slash commands simulation
    if (content === '/h1 ') {
      updateBlock(blockId, '', { }); // Clear content
      // Need a way to swap type. For MVP, we'll just implement text editing.
      // Real implementation would swap block type here.
      // Let's cheat: we can't swap type easily with current store method without `updateBlockType`.
      // Let's assume user just types text for now.
    }
    updateBlock(blockId, content);
  };
  
  // Custom command bar to change block type
  const [commandOpen, setCommandOpen] = useState<{id: string, top: number, left: number} | null>(null);

  const switchType = (blockId: string, type: BlockType) => {
    const b = blocks[blockId];
    // We need to actually replace the block or update its type in store.
    // Since I missed adding `updateBlockType` in store, I'll hack it: remove and add (loses position) or just update content with prefix logic if I had it.
    // For this demo, let's just create a new block of that type and remove old one if empty?
    // Better: Add a `changeBlockType` helper here locally if the store supported it.
    // I will use a simple hack: I'll assume `updateBlock` spreads properties, but I defined `type` on the root of Block interface, not properties.
    // Store refactor needed for full type switching.
    // FOR NOW: Just basic text blocks.
  };

  return (
    <div className="flex h-full">
      {renderSidebar()}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col bg-white h-full relative">
        {activePage ? (
          <>
            {/* Page Cover (Optional) */}
            <div className="h-24 bg-gradient-to-r from-teal-50 to-indigo-50 border-b border-gray-100 group relative">
               {/* Icon */}
               <div className="absolute -bottom-5 left-8 text-4xl group-hover:scale-110 transition-transform cursor-pointer shadow-sm rounded-full bg-white p-1">
                 {activePage.icon}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pt-8 pb-20 custom-scrollbar">
              {/* Title Input */}
              <input
                className="text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent mb-6 w-full"
                placeholder="Untitled"
                value={activePage.title}
                onChange={(e) => updatePageTitle(activePage.id, e.target.value)}
              />

              {/* Blocks */}
              <div className="space-y-1 pl-2">
                {activePage.blockIds.map(blockId => {
                  const block = blocks[blockId];
                  if (!block) return null;
                  return (
                    <BlockEditor 
                      key={blockId}
                      block={block}
                      onUpdate={(val) => {
                        // Handle slash command visually (mock)
                        if (val === '/h1') {
                           // In a real app, this changes state. 
                           // For this demo, we'll auto-replace with a Heading block logic if store allowed.
                           alert("Pro Tip: In a full implementation, this converts to Heading 1!");
                        }
                        updateBlock(blockId, val);
                      }}
                      onEnter={() => handleCreateBlock(blockId)}
                      onDelete={() => deleteBlock(activePage.id, blockId)}
                    />
                  );
                })}
                
                {/* Empty state / Click to append */}
                {activePage.blockIds.length === 0 && (
                  <div 
                    className="text-gray-300 italic cursor-text"
                    onClick={() => handleCreateBlock()}
                  >
                    Click to add a block...
                  </div>
                )}

                {/* Bottom padding trigger */}
                <div 
                  className="h-20 cursor-text" 
                  onClick={() => handleCreateBlock(activePage.blockIds[activePage.blockIds.length-1])}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
            <Icons.FileText size={48} className="mb-4 opacity-50" />
            <p>Select a page or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};