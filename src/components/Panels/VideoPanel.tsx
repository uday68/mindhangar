import React, { useState, useEffect } from 'react';
import { summarizeContent } from '@/services/geminiService';
import { useStore } from '@/store/useStore';
import { Icons } from '../Icons';

// Mock approved list of educational video IDs (e.g., Lofi Girl, Study Music)
const APPROVED_EDUCATIONAL_IDS = [
  'jfKfPfyJRdk', // Lofi Girl - beats to relax/study to
  '5qap5aO4i9A', // Lofi Girl - Synthwave
  'M5QY2_8704o', // Relaxing Jazz
  'DWcJFNfaw9c', // Ambient Study
];

export const VideoPanel: React.FC = () => {
  const { focusSession, isFocusMode, setCurrentTranscript } = useStore();
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>('transcript');
  const [videoUrl, setVideoUrl] = useState('');
  const [embedId, setEmbedId] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Restriction State
  const [isRestricted, setIsRestricted] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  // Sync Transcript to Global Store (Commercial Feature)
  useEffect(() => {
    setCurrentTranscript(transcriptText);
  }, [transcriptText, setCurrentTranscript]);

  // Extract ID from YouTube URL
  const extractVideoID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleLoadVideo = () => {
    const id = extractVideoID(videoUrl);
    if (id) {
      setEmbedId(id);
      // Restriction check happens in useEffect
    } else {
      alert("Invalid YouTube URL");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setTranscriptText(ev.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  // Enforce Focus Mode Restrictions
  useEffect(() => {
    if (embedId) {
      if (isFocusMode) {
        if (!APPROVED_EDUCATIONAL_IDS.includes(embedId)) {
          setIsRestricted(true);
        } else {
          setIsRestricted(false);
        }
      } else {
        setIsRestricted(false);
      }
    }
  }, [isFocusMode, embedId]);

  // React to Focus Session Timer changes (for warnings)
  useEffect(() => {
    if (focusSession.isActive) {
      if (focusSession.timeLeft < 30 && focusSession.mode === 'break') {
        setWarning(`Break ending in ${focusSession.timeLeft}s! Player will close.`);
      } else if (focusSession.timeLeft < 10 && focusSession.mode === 'focus') {
         setWarning(null);
      } else {
        setWarning(null);
      }
    } else {
      if (embedId && warning) {
        setWarning(null);
      }
    }

  }, [focusSession.isActive, focusSession.mode, focusSession.timeLeft, embedId, warning]);

  const handleSummarize = async () => {
    if (!transcriptText.trim()) return;
    setLoading(true);
    setActiveTab('summary');
    const result = await summarizeContent(transcriptText, 'video');
    setSummary(result);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 -m-4">
      
      {/* Video Player Area */}
      <div className="relative w-full aspect-video bg-black group shrink-0">
        {embedId ? (
          <>
            {isRestricted ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center z-10">
                 <Icons.Eye size={48} className="text-red-500 mb-4" />
                 <h3 className="text-xl font-bold mb-2">Focus Mode Active</h3>
                 <p className="text-sm text-gray-300 max-w-xs mx-auto">
                   Only approved study playlists (e.g. Lofi Girl) are allowed during deep work sessions.
                 </p>
                 <div className="flex gap-3 mt-6">
                    <button onClick={() => setEmbedId('')} className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors">Close Player</button>
                    <button onClick={() => setEmbedId('jfKfPfyJRdk')} className="px-4 py-2 bg-teal-600 rounded-lg hover:bg-teal-700 text-sm font-medium transition-colors">Load Lofi Girl</button>
                 </div>
              </div>
            ) : (
               <iframe
                 className="w-full h-full"
                 src={`https://www.youtube.com/embed/${embedId}?autoplay=1`}
                 title="YouTube video player"
                 frameBorder="0"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
               ></iframe>
            )}
            
            {/* Warning Overlay */}
            {warning && !isRestricted && (
              <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center text-xs font-bold py-1 animate-pulse z-50">
                {warning}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4">
            <Icons.Video size={32} className="mb-2 opacity-50" />
            <div className="flex gap-2 w-full max-w-xs">
               <input 
                 value={videoUrl}
                 onChange={(e) => setVideoUrl(e.target.value)}
                 placeholder="Paste YouTube URL..."
                 className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs rounded px-2 py-1 focus:ring-1 focus:ring-teal-500 outline-none"
               />
               <button onClick={handleLoadVideo} className="bg-teal-600 text-white px-3 py-1 rounded text-xs hover:bg-teal-700">Load</button>
            </div>
            {isFocusMode && (
               <p className="text-[10px] text-orange-400 mt-2 text-center flex items-center gap-1 justify-center">
                 <Icons.ShieldAlert size={10} /> Focus Mode: Entertainment blocked.
               </p>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button 
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors border-b-2 ${activeTab === 'transcript' ? 'border-teal-500 text-teal-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Transcript
        </button>
        <button 
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors border-b-2 ${activeTab === 'summary' ? 'border-teal-500 text-teal-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          AI Summary
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'transcript' && (
          <div className="absolute inset-0 flex flex-col p-4 overflow-y-auto">
             <div className="flex gap-2 mb-2">
                <input 
                  className="w-full text-xs bg-gray-100 border-none rounded p-2 focus:ring-1 focus:ring-teal-500" 
                  placeholder="Paste transcript or upload..."
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                />
                <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-colors">
                  <input type="file" className="hidden" accept=".txt,.vtt,.srt,.md" onChange={handleFileUpload} />
                  <Icons.FileText size={14} /> Upload
                </label>
             </div>
             {transcriptText ? (
               <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-sans">{transcriptText}</p>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                 <span className="text-xs">No transcript available</span>
                 <p className="text-[10px] text-gray-400 text-center px-4">
                   Upload a .txt, .vtt, or .srt file to generate a summary using Gemini 2.5.
                 </p>
               </div>
             )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="absolute inset-0 flex flex-col p-4 overflow-y-auto bg-white/40">
            {!summary && !loading && (
              <div className="text-center mt-8">
                <button
                  onClick={handleSummarize}
                  disabled={!transcriptText}
                  className="bg-indigo-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  Generate Summary
                </button>
                <p className="text-[10px] text-gray-400 mt-2">Requires transcript text</p>
              </div>
            )}
            
            {loading && (
               <div className="space-y-3 animate-pulse">
                 <div className="h-4 bg-gray-200 rounded w-3/4" />
                 <div className="h-4 bg-gray-200 rounded w-full" />
                 <div className="h-4 bg-gray-200 rounded w-5/6" />
               </div>
            )}

            {summary && (
              <div className="prose prose-sm prose-indigo text-gray-700 leading-relaxed">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                   <Icons.Sparkles size={12} className="text-teal-500" /> Key Insights
                </h4>
                <div className="whitespace-pre-line">{summary}</div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer Actions */}
      <div className="p-2 border-t border-gray-100 flex justify-between bg-white/80">
         <button className="p-2 text-gray-400 hover:text-indigo-600 rounded transition-colors" title="Export"><Icons.ExternalLink size={16} /></button>
         <button className="p-2 text-gray-400 hover:text-teal-600 rounded transition-colors" title="Save to Notes"><Icons.Save size={16} /></button>
      </div>
    </div>
  );
};
