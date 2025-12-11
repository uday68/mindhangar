import React, { useState } from 'react';
import { useStore, LAYOUT_PRESETS } from '../../store/useStore';
import { testConnection } from '../../services/geminiService';
import { Icons } from '../Icons';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, userStats, resetLayout, user, toggleMarketingMode } = useStore();
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleTestConnection = async () => {
    if (!settings.apiKey) return;
    setTestStatus('loading');
    const isWorking = await testConnection(settings.apiKey);
    setTestStatus(isWorking ? 'success' : 'error');
    
    // Auto reset success message after 3 seconds
    if (isWorking) {
        setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 px-1">
      {/* Profile Section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 p-0.5">
             {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full rounded-full object-cover border-2 border-white" alt="Profile" />
             ) : (
                <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center border-2 border-white text-slate-500 font-bold">
                   {user?.name?.[0] || 'U'}
                </div>
             )}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{user?.name || settings.username}</h3>
            <p className="text-xs text-gray-500">Level {userStats.level} Scholar</p>
          </div>
          <button className="ml-auto text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600 font-medium transition-colors">
            Edit
          </button>
        </div>
      </section>

      {/* Workspace Layout Section */}
      <section>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Workspace Layouts</h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(LAYOUT_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => resetLayout(key)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white hover:border-teal-400 hover:bg-teal-50 hover:shadow-md transition-all group"
            >
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white text-gray-400 group-hover:text-teal-600 transition-colors">
                {key === 'Cinema' ? <Icons.MonitorPlay size={20} /> : 
                 key === 'Research' ? <Icons.Search size={20} /> : 
                 <Icons.LayoutGrid size={20} />}
              </div>
              <span className="text-[10px] font-bold text-gray-600 group-hover:text-teal-700">{key}</span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 px-1">Click to apply a new workspace arrangement. Windows will reset to default positions.</p>
      </section>

      {/* API Configuration */}
      <section className="bg-white/50 p-4 rounded-xl border border-white shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-gray-700">
           <Icons.Sparkles size={16} className="text-indigo-500" />
           <h4 className="font-semibold text-sm">AI Configuration</h4>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Gemini API Key</label>
                {testStatus === 'success' && <span className="text-[10px] font-bold text-green-600 animate-in fade-in">Connection Verified</span>}
                {testStatus === 'error' && <span className="text-[10px] font-bold text-red-500 animate-in fade-in">Connection Failed</span>}
            </div>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <input 
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => updateSettings({ apiKey: e.target.value })}
                    placeholder="Paste key starting with AIza..."
                    className={`w-full bg-white border rounded-lg pl-3 pr-8 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${testStatus === 'error' ? 'border-red-300' : 'border-gray-200'}`}
                />
                <div 
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${settings.apiKey && settings.apiKey.length > 20 ? 'bg-green-500' : 'bg-gray-300'}`} 
                    title={settings.apiKey ? "Key format valid" : "Key missing"} 
                />
              </div>
              <button 
                onClick={handleTestConnection}
                disabled={!settings.apiKey || testStatus === 'loading'}
                className={`px-4 rounded-lg text-xs font-bold transition-all ${
                    testStatus === 'loading' ? 'bg-gray-100 text-gray-400' :
                    testStatus === 'success' ? 'bg-green-100 text-green-700' :
                    testStatus === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {testStatus === 'loading' ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : 
                 testStatus === 'success' ? 'OK' : 
                 testStatus === 'error' ? 'Retry' : 'Test'}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Required for Chat, Summarization, and Planner. Saved locally.</p>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preferences</h4>
        
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-teal-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><Icons.Eye size={16} /></div>
            <div>
              <p className="text-sm font-medium text-gray-700">Camera Focus Tracking</p>
              <p className="text-[10px] text-gray-400">Allow visual attention monitoring</p>
            </div>
          </div>
          <div 
            onClick={() => updateSettings({ enableCamera: !settings.enableCamera })}
            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${settings.enableCamera ? 'bg-teal-500' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow transition-all ${settings.enableCamera ? 'left-6' : 'left-1'}`} />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-teal-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Icons.Calendar size={16} /></div>
            <div>
              <p className="text-sm font-medium text-gray-700">Sync to Google Calendar</p>
              <p className="text-[10px] text-gray-400">Push study sessions automatically</p>
            </div>
          </div>
          <button className="text-xs text-indigo-600 font-bold hover:underline">Connect</button>
        </div>
      </section>
      
      {/* Dev Tools */}
      <section className="border-t border-gray-100 pt-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Developer Tools</h4>
        <button 
          onClick={toggleMarketingMode}
          className="w-full bg-slate-800 text-white rounded-lg py-3 text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
        >
          <Icons.MonitorPlay size={14} /> Open Asset Generator
        </button>
        <p className="text-[9px] text-gray-400 mt-1 text-center">Use this to generate screenshots for Kaggle/YouTube.</p>
      </section>

      <div className="mt-auto text-center">
        <p className="text-[10px] text-gray-400">MindHangar Enterprise v2.0 • Local Secure Storage</p>
      </div>
    </div>
  );
};