import React, { useState, useRef } from 'react';
import { Icons } from '../Icons';
import { useStore } from '../../store/useStore';

export const FocusPanel: React.FC = () => {
  const { setFocusMode, isFocusMode, focusSession, startSession, stopSession } = useStore();
  
  // Local UI state
  const [deepFocusEnabled, setDeepFocusEnabled] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25); // Default 25 min
  
  // Focus Test State
  const [showTest, setShowTest] = useState(false);
  const [testState, setTestState] = useState<'intro' | 'waiting' | 'now' | 'result'>('intro');
  const [reactionTime, setReactionTime] = useState(0);
  const testTimeoutRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  const { isActive, timeLeft, mode } = focusSession;

  const handleStartFlow = () => {
    if (isActive) {
      // Stop logic
      stopSession();
    } else {
      // Start flow -> Go to test first
      setShowTest(true);
      setTestState('intro');
    }
  };

  // --- Focus Test Logic ---
  const startFocusTest = () => {
    setTestState('waiting');
    const delay = 2000 + Math.random() * 3000; // 2-5 seconds random delay
    testTimeoutRef.current = setTimeout(() => {
      setTestState('now');
      startTimeRef.current = performance.now();
    }, delay);
  };

  const handleTestClick = () => {
    if (testState === 'waiting') {
      clearTimeout(testTimeoutRef.current);
      setTestState('intro');
      alert("Too early! Wait for the color to change.");
    } else if (testState === 'now') {
      const end = performance.now();
      setReactionTime(Math.round(end - startTimeRef.current));
      setTestState('result');
    }
  };

  const confirmStartSession = (sessionMode: 'focus' | 'break' = 'focus') => {
    setShowTest(false);
    startSession(sessionMode, sessionDuration * 60);
    if (deepFocusEnabled && sessionMode === 'focus') {
      setFocusMode(true);
    }
  };

  const getFocusGrade = (ms: number) => {
    if (ms < 250) return { label: "Sharp! ⚡️", color: "text-green-600" };
    if (ms < 400) return { label: "Good", color: "text-blue-600" };
    return { label: "Groggy 😴", color: "text-orange-600" };
  };
  // ------------------------

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleCamera = async () => {
    if (cameraActive) {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error("Camera access denied", err);
        alert("Camera access denied. Please check permissions.");
      }
    }
  };

  // Render Test Overlay
  if (showTest && !isActive) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4 text-center relative">
        <button onClick={() => setShowTest(false)} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600">
          <Icons.X size={20} />
        </button>

        {testState === 'intro' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto">
              <Icons.Brain size={32} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Focus Calibration</h3>
            <p className="text-sm text-gray-500 max-w-[250px] mx-auto">
              Click the circle as soon as it turns <strong>GREEN</strong> to test your alertness.
            </p>
            <button 
              onClick={startFocusTest}
              className="w-full bg-teal-600 text-white rounded-lg py-3 font-bold hover:bg-teal-700 transition-colors"
            >
              I'm Ready
            </button>
            <div className="flex gap-4 justify-center">
              <button onClick={() => confirmStartSession('focus')} className="text-xs text-gray-400 underline">Skip (Focus)</button>
              <button onClick={() => confirmStartSession('break')} className="text-xs text-gray-400 underline">Skip (Break)</button>
            </div>
          </div>
        )}

        {testState === 'waiting' && (
           <div 
             className="w-48 h-48 rounded-full bg-red-500 shadow-xl flex items-center justify-center cursor-pointer animate-pulse"
             onMouseDown={handleTestClick}
           >
             <span className="text-white font-bold text-xl">WAIT...</span>
           </div>
        )}

        {testState === 'now' && (
           <div 
             className="w-48 h-48 rounded-full bg-green-500 shadow-xl flex items-center justify-center cursor-pointer transform active:scale-95 transition-transform"
             onMouseDown={handleTestClick}
           >
             <span className="text-white font-bold text-xl">CLICK!</span>
           </div>
        )}

        {testState === 'result' && (
          <div className="space-y-4">
            <h3 className="text-gray-500 text-sm uppercase tracking-wide">Reaction Time</h3>
            <div className="text-5xl font-mono font-bold text-gray-800">{reactionTime}ms</div>
            <div className={`text-xl font-bold ${getFocusGrade(reactionTime).color}`}>
              {getFocusGrade(reactionTime).label}
            </div>
            
            <div className="pt-4 space-y-2">
              <button 
                onClick={() => confirmStartSession('focus')}
                className="w-full bg-indigo-600 text-white rounded-lg py-3 font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
              >
                Start Studying
              </button>
              <button onClick={() => setTestState('intro')} className="text-xs text-gray-400">Retry</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Normal Focus Panel
  return (
    <div className="flex flex-col h-full gap-4 items-center justify-center p-2 relative">
      {isFocusMode && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold animate-pulse">
          LOCKED MODE ACTIVE
        </div>
      )}

      {/* Timer Display */}
      <div className="text-center">
        <h2 className={`font-bold text-gray-800 font-mono tracking-tighter mb-2 transition-all ${isFocusMode ? 'text-8xl scale-110' : 'text-6xl'}`}>
          {formatTime(timeLeft)}
        </h2>
        <div className="text-sm uppercase tracking-widest text-gray-400 mb-4 font-semibold">{isActive ? mode : 'Ready'}</div>
        
        {/* Controls */}
        <div className="flex flex-col gap-2 justify-center mb-4">
          <button 
            onClick={handleStartFlow} 
            className={`px-6 py-2 rounded-full font-medium transition-colors shadow-lg ${
              isActive 
                ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200' 
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/30'
            }`}
          >
            {isActive ? 'Stop Session' : 'Start Focus'}
          </button>
          
          {!isActive && (
             <div className="flex gap-2 justify-center mt-2">
                <button onClick={() => setSessionDuration(25)} className={`px-2 py-1 text-xs rounded ${sessionDuration===25 ? 'bg-gray-200 font-bold' : 'bg-gray-100'}`}>25m</button>
                <button onClick={() => setSessionDuration(50)} className={`px-2 py-1 text-xs rounded ${sessionDuration===50 ? 'bg-gray-200 font-bold' : 'bg-gray-100'}`}>50m</button>
                <button onClick={() => setSessionDuration(5)} className={`px-2 py-1 text-xs rounded ${sessionDuration===5 ? 'bg-gray-200 font-bold' : 'bg-gray-100'}`}>5m Break</button>
             </div>
          )}
        </div>

        {/* Deep Focus Toggle */}
        {!isActive && (
          <div className="flex items-center justify-center gap-2 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <input 
              type="checkbox" 
              id="deepFocus" 
              checked={deepFocusEnabled}
              onChange={(e) => setDeepFocusEnabled(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="deepFocus" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
              One Activity Mode
            </label>
            <div className="group relative">
               <div className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] flex items-center justify-center cursor-help">?</div>
               <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                 Blocks all other panels. On mobile app: Silences notifications & blocks apps.
               </span>
            </div>
          </div>
        )}
      </div>

      {/* Camera Section */}
      {!isFocusMode && (
        <div className="w-full max-w-[200px] bg-black/5 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center border border-gray-200">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`} 
          />
          {!cameraActive && (
            <div className="text-center">
              <Icons.Eye className="mx-auto text-gray-400 mb-2 w-6 h-6" />
              <p className="text-[10px] text-gray-500">Camera off</p>
            </div>
          )}
          <button 
            onClick={toggleCamera} 
            className="absolute bottom-1 right-1 bg-white/80 backdrop-blur text-[10px] px-2 py-0.5 rounded shadow-sm hover:bg-white"
          >
            {cameraActive ? 'Stop' : 'Track'}
          </button>
        </div>
      )}
    </div>
  );
};