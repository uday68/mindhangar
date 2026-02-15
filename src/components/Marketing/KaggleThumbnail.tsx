import React, { useState } from 'react';
import { Icons } from '../Icons';
import { Card } from '../Shared/Card';
import { Thumbnail } from '../Shared/Thumbnail';

export const KaggleThumbnail: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [format, setFormat] = useState<'thumbnail' | 'square'>('thumbnail');

  const containerStyles = format === 'thumbnail' 
    ? { width: '1280px', height: '720px' } 
    : { width: '800px', height: '800px' };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/90 flex flex-col items-center justify-center p-10 overflow-auto">
      
      {/* Controls */}
      <div className="flex items-center gap-4 mb-8 bg-white/10 p-2 rounded-xl backdrop-blur">
        <button 
          onClick={() => setFormat('thumbnail')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${format === 'thumbnail' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
        >
          Thumbnail (16:9)
        </button>
        <button 
          onClick={() => setFormat('square')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${format === 'square' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
        >
          Social Card (1:1)
        </button>
        <div className="w-px h-6 bg-white/20 mx-2" />
        <button 
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-bold text-white hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          Close
        </button>
      </div>

      {/* The Artboard */}
      <div 
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center shrink-0 transition-all duration-500"
        style={{ fontFamily: 'Inter, sans-serif', ...containerStyles }}
      >
        {/* Background FX */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#14b8a6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />

        {/* Composition Container */}
        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Logo Mark */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-teal-400 blur-2xl opacity-20" />
            <div className="w-24 h-24 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
              <span className="text-6xl font-bold text-white tracking-tighter">M</span>
            </div>
          </div>

          {/* Title */}
          <h1 className={`${format === 'thumbnail' ? 'text-8xl' : 'text-7xl'} font-black text-white tracking-tighter mb-2 drop-shadow-lg`}>
            MindHangar
          </h1>
          <div className="flex items-center gap-4 text-2xl font-medium text-teal-100/80 tracking-widest uppercase mb-12">
            <span>Plan</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>Focus</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>Learn</span>
          </div>

          {/* Floating UI Cards Showcase */}
          <div className={`flex gap-6 relative ${format === 'square' ? 'scale-90 mt-4' : ''}`}>
            {/* Left Card - Planner */}
            <div className="w-64 -rotate-6 transform translate-y-4">
              <Card variant="glass" className="bg-white/90 backdrop-blur-xl border-white/20 p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                  <Icons.Calendar className="text-indigo-500" size={20} />
                  <span className="font-bold text-gray-700">AI Planner</span>
                </div>
                <div className="space-y-2">
                   <div className="h-2 bg-gray-100 rounded w-3/4" />
                   <div className="h-2 bg-gray-100 rounded w-1/2" />
                   <div className="mt-2 p-2 bg-indigo-50 rounded border border-indigo-100">
                      <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-bold text-indigo-700">Calculus Exam</span>
                      </div>
                   </div>
                </div>
              </Card>
            </div>

            {/* Center Card - Video/Insight */}
            <div className="w-80 z-20 transform hover:scale-105 transition-transform duration-500">
              <Card variant="glass" className="bg-white/95 backdrop-blur-xl border-teal-200/30 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                 <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden mb-3 group">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
                        <Icons.MonitorPlay className="text-white ml-1" size={24} />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] text-white font-mono">
                       AI ANALYSIS ACTIVE
                    </div>
                 </div>
                 <div className="px-3 pb-2">
                    <h3 className="font-bold text-gray-800 text-sm mb-1">Lecture 4: Neural Networks</h3>
                    <div className="flex gap-1">
                      <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold">Summary Ready</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">Quiz Gen</span>
                    </div>
                 </div>
              </Card>
            </div>

            {/* Right Card - Stats */}
            <div className="w-64 rotate-6 transform translate-y-4">
               <Card variant="glass" className="bg-white/90 backdrop-blur-xl border-white/20 p-4 shadow-2xl">
                  <div className="flex items-center gap-2 mb-3">
                     <Icons.TrendingUp className="text-teal-500" size={20} />
                     <span className="font-bold text-gray-700">Focus Stats</span>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                     <span className="text-3xl font-bold text-gray-800">2.5h</span>
                     <span className="text-xs text-gray-500 mb-1">Deep Work</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                     <div className="bg-teal-500 w-[75%] h-full rounded-full" />
                  </div>
               </Card>
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div className={`absolute bottom-8 flex gap-4 opacity-60 ${format === 'square' ? 'bottom-12' : ''}`}>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-white/80 text-xs font-mono">
               <div className="w-2 h-2 bg-[#61DAFB] rounded-full" /> React 19
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-white/80 text-xs font-mono">
               <div className="w-2 h-2 bg-[#4285F4] rounded-full" /> Google Gemini 2.5
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-white/80 text-xs font-mono">
               <div className="w-2 h-2 bg-[#38BDF8] rounded-full" /> Tailwind CSS
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};