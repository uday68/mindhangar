import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons';
import { useStore } from '../../store/useStore';
import { analyzeFocusFrame } from '../../services/geminiService';

export const FocusPanel: React.FC = () => {
  const { setFocusMode, isFocusMode, focusSession, startSession, stopSession, settings } = useStore();
  
  // Local UI state
  const [deepFocusEnabled, setDeepFocusEnabled] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(25); // Current timer target in minutes

  // AI Monitor State
  const [focusState, setFocusState] = useState<'idle' | 'focused' | 'distracted' | 'absent'>('idle');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sensitivity: 'medium' as 'low' | 'medium' | 'high'
  });
  
  // Focus Test State
  const [showTest, setShowTest] = useState(false);
  const [testState, setTestState] = useState<'intro' | 'waiting' | 'now' | 'result'>('intro');
  const [reactionTime, setReactionTime] = useState(0);
  const testTimeoutRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { isActive, timeLeft, mode } = focusSession;

  // Sync current duration when config changes (if not active)
  useEffect(() => {
    if (!isActive) {
      setCurrentDuration(config.focusDuration);
    }
  }, [config.focusDuration, isActive]);

  // AI Monitoring Loop
  useEffect(() => {
    let interval: any;
    
    const captureAndAnalyze = async () => {
       if (!videoRef.current || !settings.apiKey || !cameraActive) return;
       
       // Create canvas to capture frame
       const canvas = document.createElement('canvas');
       canvas.width = 320; // Reduce size for speed
       canvas.height = 240;
       const ctx = canvas.getContext('2d');
       if (!ctx) return;
       
       ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
       const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
       
       const result = await analyzeFocusFrame(settings.apiKey, base64);
       setLastCheckTime(new Date());
       
       if (result) {
          setFocusState(result.status as any);
          if (result.status === 'distracted' || result.status === 'absent') {
             setAiSuggestion(result.suggestion || "Let's get back to it!");
             // Auto-dismiss suggestion after 5s
             setTimeout(() => setAiSuggestion(''), 5000);
          } else {
             setAiSuggestion('');
          }
       }
    };

    if (cameraActive && settings.apiKey) {
      // Check every 15 seconds to respect rate limits while maintaining utility
      interval = setInterval(captureAndAnalyze, 15000); 
    }
    
    return () => clearInterval(interval);
  }, [cameraActive, settings.apiKey]);


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

  const confirmStartSession = (sessionMode: 'focus' | 'break' = 'focus', durationOverride?: number) => {
    setShowTest(false);
    
    let duration = durationOverride;
    if (!duration) {
      duration = sessionMode === 'focus' ? config.focusDuration : config.shortBreakDuration;
    }

    startSession(sessionMode, duration * 60);
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
      setFocusState('idle');
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
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
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
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
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
                Start Studying ({config.focusDuration}m)
              </button>
              <button onClick={() => setTestState('intro')} className="text-xs text-gray-400">Retry</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Settings View
  if (showSettings && !isActive) {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-4 relative animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <Icons.Settings size={18} /> Focus Settings
          </h3>
          <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-200 rounded text-gray-500">
            <Icons.X size={18} />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto">
          {/* Timers */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Timer Durations (min)</h4>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Focus Session</span>
                <span className="font-bold text-teal-600">{config.focusDuration}m</span>
              </div>
              <input 
                type="range" min="15" max="90" step="5"
                value={config.focusDuration}
                onChange={(e) => setConfig({...config, focusDuration: parseInt(e.target.value)})}
                className="w-full accent-teal-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Short Break</span>
                <span className="font-bold text-indigo-600">{config.shortBreakDuration}m</span>
              </div>
              <input 
                type="range" min="2" max="15"
                value={config.shortBreakDuration}
                onChange={(e) => setConfig({...config, shortBreakDuration: parseInt(e.target.value)})}
                className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Long Break</span>
                <span className="font-bold text-indigo-600">{config.longBreakDuration}m</span>
              </div>
              <input 
                type="range" min="10" max="45" step="5"
                value={config.longBreakDuration}
                onChange={(e) => setConfig({...config, longBreakDuration: parseInt(e.target.value)})}
                className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* AI / Sensitivity */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detection Sensitivity</h4>
             <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfig({...config, sensitivity: level})}
                    className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-colors ${config.sensitivity === level ? 'bg-teal-100 text-teal-700 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {level}
                  </button>
                ))}
             </div>
             <p className="text-[10px] text-gray-400 leading-tight">
               Higher sensitivity will detect distractions more aggressively but may cause false alarms.
             </p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <button 
            onClick={() => setShowSettings(false)}
            className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  // Normal Focus Panel
  return (
    <div className="flex flex-col h-full gap-4 items-center justify-center p-2 relative group">
      
      {/* LOCKED MODE INDICATOR */}
      {isFocusMode && (
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold animate-pulse">
            LOCKED MODE ACTIVE
          </div>
          {cameraActive && (
             <div className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 ${focusState === 'focused' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${focusState === 'focused' ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`} />
               {focusState === 'idle' ? 'MONITORING' : focusState.toUpperCase()}
             </div>
          )}
        </div>
      )}
      
      {/* AI Suggestion Popup */}
      {aiSuggestion && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-orange-600 text-white px-4 py-2 rounded-full shadow-xl animate-in fade-in slide-in-from-top-4 font-medium text-sm text-center w-max max-w-[90%]">
          <div className="flex items-center gap-2">
            <Icons.Brain size={16} />
            <span>{aiSuggestion}</span>
          </div>
        </div>
      )}

      {/* Settings Toggle (Only visible when not active or if unlocked) */}
      {!isActive && !isFocusMode && (
        <button 
          onClick={() => setShowSettings(true)}
          className="absolute top-2 left-2 p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Focus Settings"
        >
          <Icons.Settings size={18} />
        </button>
      )}

      {/* Timer Display */}
      <div className="text-center">
        <h2 className={`font-bold text-gray-800 font-mono tracking-tighter mb-2 transition-all ${isFocusMode ? 'text-8xl scale-110' : 'text-6xl'}`}>
          {formatTime(isActive ? timeLeft : (mode === 'break' ? timeLeft : currentDuration * 60))}
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
            {isActive ? 'Stop Session' : `Start Focus (${currentDuration}m)`}
          </button>
          
          {!isActive && (
             <div className="flex gap-2 justify-center mt-2">
                <button 
                   onClick={() => setCurrentDuration(config.focusDuration)} 
                   className={`px-3 py-1 text-xs rounded transition-colors ${currentDuration === config.focusDuration ? 'bg-teal-100 text-teal-800 font-bold border border-teal-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  Focus {config.focusDuration}m
                </button>
                <button 
                   onClick={() => confirmStartSession('break', config.shortBreakDuration)} 
                   className="px-3 py-1 text-xs rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 font-medium transition-colors"
                >
                  Break {config.shortBreakDuration}m
                </button>
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

      {/* Camera Section - Always render but handle visibility */}
      <div 
        className={`w-full max-w-[200px] bg-black/5 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center border border-gray-200 transition-all hover:border-teal-300 ${isFocusMode ? 'opacity-0 pointer-events-none absolute bottom-4 right-4 h-0 w-0' : ''}`}
      >
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
            <p className="text-[10px] text-gray-500">AI Monitor Off</p>
          </div>
        )}
        <button 
          onClick={toggleCamera} 
          className="absolute bottom-1 right-1 bg-white/80 backdrop-blur text-[10px] px-2 py-0.5 rounded shadow-sm hover:bg-white font-medium"
        >
          {cameraActive ? 'Stop' : 'Track'}
        </button>
        
        {cameraActive && (
           <div className={`absolute top-1 left-1 px-1.5 py-0.5 backdrop-blur rounded text-[8px] font-mono border ${focusState === 'focused' ? 'bg-green-500/80 text-white border-green-400' : focusState === 'distracted' ? 'bg-orange-500/80 text-white border-orange-400' : 'bg-black/50 text-white border-transparent'}`}>
             {focusState === 'idle' ? 'INIT...' : focusState.toUpperCase()}
           </div>
        )}
      </div>
    </div>
  );
};