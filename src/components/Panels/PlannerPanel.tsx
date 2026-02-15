import React, { useState } from 'react';
import { generatePlanSuggestion, generatePerformanceReview, generateLearningRoadmap, ReviewData } from '@/services/geminiService';
import { LearningRoadmap } from '../../types';
import { useStore } from '@/store/useStore';
import { Icons } from '../Icons';

export const PlannerPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'strategy' | 'roadmap'>('roadmap');

  // Schedule State
  const [goals, setGoals] = useState<string>("");
  const [plan, setPlan] = useState<string[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [mood, setMood] = useState<string | null>(null);

  // Strategy Review State
  const [reviewTopic, setReviewTopic] = useState("");
  const [confidence, setConfidence] = useState(5);
  const [confusion, setConfusion] = useState("");
  const [reviewResult, setReviewResult] = useState<{
    diagnosis: string;
    technique: string;
    technique_description: string;
    action_plan: string[];
  } | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Roadmap State
  const [roadmapInput, setRoadmapInput] = useState({ goal: '', level: 'Beginner', time: '' });
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const handleGeneratePlan = async () => {
    if (!goals) return;
    setScheduleLoading(true);
    const goalList = goals.split(',').map((goal) => goal.trim()).filter((goal) => goal.length > 0);
    const result = await generatePlanSuggestion(goalList);
    const lines = result ? result.split('\n').filter(line => line.trim().length > 0) : ["No plan generated."];
    setPlan(lines);
    setScheduleLoading(false);
  };

  const handleGenerateReview = async () => {
    if (!reviewTopic || !confusion) return;
    setReviewLoading(true);
    setReviewResult(null);
    
    const data: ReviewData = {
      topic: reviewTopic,
      confidence,
      confusion
    };
    
    const result = await generatePerformanceReview(data);
    setReviewResult(result);
    setReviewLoading(false);
  };

  const handleGenerateRoadmap = async () => {
    if (!roadmapInput.goal || !roadmapInput.time) return;
    setRoadmapLoading(true);
    const result = await generateLearningRoadmap(roadmapInput.goal, roadmapInput.level, roadmapInput.time);
    setRoadmap(result);
    setRoadmapLoading(false);
  };

  const handleSaveRoadmapToNotes = () => {
    if (!roadmap) return;
    // Direct store access for synchronous chain of actions
    const store = useStore.getState();
    
    // 1. Create Page
    store.createPage();
    const newPageId = useStore.getState().activePageId; // Get the ID of the newly created page

    if (newPageId) {
      // 2. Set Title
      store.updatePageTitle(newPageId, `Roadmap: ${roadmap.title}`);
      
      // 3. Add Content Blocks
      store.addBlock(newPageId, 'text', `**Goal:** ${roadmap.description}`);
      
      roadmap.modules.forEach((mod) => {
        store.addBlock(newPageId, 'h2', `${mod.week}: ${mod.title}`);
        store.addBlock(newPageId, 'text', mod.description);
        
        if (mod.topics.length > 0) {
          store.addBlock(newPageId, 'h3', 'Key Topics');
          mod.topics.forEach(topic => store.addBlock(newPageId, 'bullet', topic));
        }

        if (mod.resources.length > 0) {
          store.addBlock(newPageId, 'h3', 'Resources');
          mod.resources.forEach(res => {
            const icon = res.type === 'video' ? '🎥' : '📄';
            store.addBlock(newPageId, 'todo', `${icon} ${res.title}`);
          });
        }
      });

      // 4. Notify User
      store.addNotification({
        type: 'success',
        title: 'Roadmap Saved',
        message: 'Your learning plan has been saved to Notes.',
      });
      
      // Optional: Switch to Notes panel?
      // store.togglePanel('notes');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-lg mb-4 shrink-0 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('roadmap')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap px-2 ${activeTab === 'roadmap' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Icons.LayoutGrid size={14} /> Roadmap
        </button>
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap px-2 ${activeTab === 'schedule' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Icons.Calendar size={14} /> Schedule
        </button>
        <button 
          onClick={() => setActiveTab('strategy')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap px-2 ${activeTab === 'strategy' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Icons.TrendingUp size={14} /> Coach
        </button>
      </div>

      {/* --- ROADMAP TAB --- */}
      {activeTab === 'roadmap' && (
        <div className="h-full flex flex-col overflow-hidden">
          {!roadmap ? (
            <div className="flex flex-col gap-4 overflow-y-auto px-1">
              <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                <h3 className="font-bold text-teal-900 mb-1 flex items-center gap-2">
                  <Icons.MonitorPlay size={18} /> AI Curriculum Designer
                </h3>
                <p className="text-xs text-teal-700 leading-relaxed">
                  Tell me what you want to learn, and I'll build a custom step-by-step roadmap with the best video & reading resources.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">I want to learn...</label>
                  <input 
                    className="w-full mt-1 p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none placeholder-gray-300"
                    placeholder="e.g. Machine Learning, Piano, French Cooking"
                    value={roadmapInput.goal}
                    onChange={(e) => setRoadmapInput({...roadmapInput, goal: e.target.value})}
                  />
                </div>

                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase">Current Level</label>
                   <div className="flex gap-2 mt-1">
                     {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                       <button
                         key={lvl}
                         onClick={() => setRoadmapInput({...roadmapInput, level: lvl})}
                         className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${roadmapInput.level === lvl ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                       >
                         {lvl}
                       </button>
                     ))}
                   </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Time Commitment</label>
                  <input 
                    className="w-full mt-1 p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none placeholder-gray-300"
                    placeholder="e.g. 5 hours a week, 2 months"
                    value={roadmapInput.time}
                    onChange={(e) => setRoadmapInput({...roadmapInput, time: e.target.value})}
                  />
                </div>

                <button 
                  onClick={handleGenerateRoadmap}
                  disabled={roadmapLoading || !roadmapInput.goal || !roadmapInput.time}
                  className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {roadmapLoading ? <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full"/> : <Icons.Sparkles size={16} />}
                  Generate My Roadmap
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
               {/* Roadmap Header */}
               <div className="bg-white p-4 border-b border-gray-100 shrink-0">
                 <div className="flex justify-between items-start mb-1">
                   <h3 className="font-bold text-lg text-gray-800 leading-tight">{roadmap.title}</h3>
                   <div className="flex gap-2">
                     <button onClick={handleSaveRoadmapToNotes} className="flex items-center gap-1 text-xs text-teal-600 font-bold hover:bg-teal-50 px-2 py-1 rounded transition-colors" title="Save to Notes">
                        <Icons.Save size={14} /> Save
                     </button>
                     <button onClick={() => setRoadmap(null)} className="text-xs text-gray-400 hover:text-red-500 underline whitespace-nowrap">Reset</button>
                   </div>
                 </div>
                 <p className="text-xs text-gray-500">{roadmap.description}</p>
               </div>

               {/* Timeline Modules */}
               <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
                  {roadmap.modules.map((mod, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-gray-200 last:border-transparent">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-teal-500 border-2 border-white shadow-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                      
                      <div className="mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-baseline mb-2">
                           <h4 className="font-bold text-gray-800">{mod.title}</h4>
                           <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase">{mod.week}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{mod.description}</p>
                        
                        {/* Topics Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                           {mod.topics.map((t, i) => (
                             <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{t}</span>
                           ))}
                        </div>

                        {/* Resources */}
                        <div className="space-y-2 pt-2 border-t border-gray-50">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recommended Content</p>
                           {mod.resources.map((res, i) => (
                             <div key={i} className="flex items-center justify-between group bg-gray-50/50 p-2 rounded hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                               <div className="flex items-center gap-2 overflow-hidden">
                                  <div className={`p-1.5 rounded-md shrink-0 ${res.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {res.type === 'video' ? <Icons.Video size={12} /> : <Icons.FileText size={12} />}
                                  </div>
                                  <span className="text-xs text-gray-700 truncate">{res.title}</span>
                               </div>
                               <a 
                                 href={res.type === 'video' ? `https://www.youtube.com/results?search_query=${encodeURIComponent(res.title)}` : `https://www.google.com/search?q=${encodeURIComponent(res.title)}`}
                                 target="_blank"
                                 rel="noreferrer"
                                 className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-indigo-600 hover:underline px-2"
                               >
                                 {res.type === 'video' ? 'Watch' : 'Read'}
                               </a>
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      )}

      {/* --- SCHEDULE TAB --- */}
      {activeTab === 'schedule' && (
        <div className="space-y-4 h-full flex flex-col overflow-hidden">
          {/* Wellness Tracker */}
          <div className="bg-gradient-to-r from-indigo-50 to-teal-50 p-3 rounded-xl border border-white/60 shrink-0">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">How's your energy?</h4>
            <div className="flex justify-between">
              {['😫', '😐', '🙂', '⚡️'].map((m) => (
                <button 
                  key={m}
                  onClick={() => setMood(m)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${mood === m ? 'bg-white shadow-md scale-110 border border-teal-200' : 'hover:bg-white/50 grayscale hover:grayscale-0'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            {mood === '😫' && <p className="text-[10px] text-orange-600 mt-2 text-center bg-orange-50 p-1 rounded">Try a 5-min focus break first.</p>}
            {mood === '⚡️' && <p className="text-[10px] text-green-600 mt-2 text-center bg-green-50 p-1 rounded">Great! Tackle your hardest task now.</p>}
          </div>

          <div className="bg-white/50 p-4 rounded-xl border border-white/60 shrink-0">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Goals (comma separated)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Master React, Finish Calculus HW"
              />
              <button 
                onClick={handleGeneratePlan}
                disabled={scheduleLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
              >
                {scheduleLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Icons.Sparkles size={16} />}
                Plan
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <h4 className="text-sm font-semibold text-gray-700">Your Schedule</h4>
            {plan.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                <Icons.Calendar className="mx-auto mb-2 opacity-50" />
                Add goals to generate a schedule
              </div>
            )}
            {plan.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className="mt-1 min-w-[16px] h-4 rounded border border-gray-300 group-hover:border-teal-500 cursor-pointer" />
                <p className="text-sm text-gray-700 leading-relaxed bg-white/40 p-2 rounded w-full">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- STRATEGY REVIEW TAB --- */}
      {activeTab === 'strategy' && (
        <div className="h-full flex flex-col overflow-hidden">
          {!reviewResult ? (
            <div className="flex flex-col gap-4 overflow-y-auto pr-1">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
                  <Icons.Target size={18} /> Performance Check-In
                </h3>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Identify where you're stuck. AI will diagnose the cognitive blocker and build a recovery plan using proven learning science.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Recent Topic / Concept</label>
                  <input 
                    className="w-full mt-1 p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g., Organic Chemistry Reactions"
                    value={reviewTopic}
                    onChange={(e) => setReviewTopic(e.target.value)}
                  />
                </div>

                <div>
                   <div className="flex justify-between">
                     <label className="text-xs font-bold text-gray-500 uppercase">Confidence Level</label>
                     <span className="text-xs font-bold text-indigo-600">{confidence}/10</span>
                   </div>
                   <input 
                     type="range" min="1" max="10" 
                     value={confidence} 
                     onChange={(e) => setConfidence(parseInt(e.target.value))}
                     className="w-full mt-2 accent-indigo-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                     <span>Lost</span>
                     <span>Mastered</span>
                   </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">What confused you?</label>
                  <textarea 
                    className="w-full mt-1 p-2 rounded-lg border border-gray-200 text-sm h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="I keep mixing up SN1 and SN2 mechanisms..."
                    value={confusion}
                    onChange={(e) => setConfusion(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleGenerateReview}
                  disabled={reviewLoading || !reviewTopic || !confusion}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {reviewLoading ? <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full"/> : <Icons.Sparkles size={16} />}
                  Analyze Weaknesses
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
               {/* Diagnosis Card */}
               <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2 mb-2 text-red-700">
                    <Icons.ShieldAlert size={18} />
                    <h4 className="font-bold text-sm uppercase">Diagnosis</h4>
                  </div>
                  <p className="text-sm text-red-900 font-medium leading-relaxed">{reviewResult.diagnosis}</p>
               </div>

               {/* Technique Card */}
               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full -mr-12 -mt-12 opacity-50 pointer-events-none" />
                  <div className="relative z-10">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Recommended Strategy</h4>
                    <h3 className="text-xl font-bold text-teal-700 mb-2">{reviewResult.technique}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{reviewResult.technique_description}</p>
                  </div>
               </div>

               {/* Action Plan */}
               <div className="space-y-2">
                 <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                   <Icons.ListChecks size={14} /> Recovery Plan
                 </h4>
                 {reviewResult.action_plan.map((step, i) => (
                   <div key={i} className="flex gap-3 bg-white/60 p-3 rounded-lg border border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-700">{step}</p>
                   </div>
                 ))}
               </div>

               <button 
                 onClick={() => setReviewResult(null)}
                 className="w-full py-2 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
               >
                 Start New Review
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
