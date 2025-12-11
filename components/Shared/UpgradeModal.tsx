import React from 'react';
import { useStore } from '../../store/useStore';
import { Icons } from '../Icons';

export const UpgradeModal: React.FC = () => {
  const { toggleUpgradeModal, upgradeToPro } = useStore();

  const features = [
    { name: "Context-Aware AI Chat", desc: "AI reads your notes & video transcript", free: false, pro: true },
    { name: "Focus Camera Tracking", desc: "AI alerts you when distracted", free: false, pro: true },
    { name: "Deep Semantic Search", desc: "Search meanings, not just keywords", free: false, pro: true },
    { name: "Unlimited AI Roadmaps", desc: "Generate custom learning paths", free: false, pro: true },
    { name: "Export to Markdown", desc: "Download your notes", free: true, pro: true },
    { name: "Synced Devices", desc: "Mobile & Desktop pairing", free: true, pro: true },
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Pitch */}
        <div className="md:w-2/5 bg-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-500 to-transparent"></div>
          
          <div className="relative z-10">
             <div className="w-12 h-12 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
               <span className="text-2xl font-bold text-white">M</span>
             </div>
             <h2 className="text-3xl font-bold mb-4">Unlock Your Full Potential</h2>
             <p className="text-slate-300 leading-relaxed">
               Upgrade to MindHangar Pro to access elite AI coaching features, distraction monitoring, and unlimited cloud synchronization.
             </p>
          </div>

          <div className="relative z-10 space-y-4 mt-8">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-white/10 rounded-lg"><Icons.Brain size={20} /></div>
               <span className="font-medium">AI Cognitive Coaching</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="p-2 bg-white/10 rounded-lg"><Icons.Eye size={20} /></div>
               <span className="font-medium">Real-time Focus Monitor</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="p-2 bg-white/10 rounded-lg"><Icons.Sparkles size={20} /></div>
               <span className="font-medium">Context-Aware Assistance</span>
             </div>
          </div>
        </div>

        {/* Right Side: Pricing */}
        <div className="md:w-3/5 p-8 bg-gray-50 overflow-y-auto">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Choose your plan</h3>
              <button onClick={toggleUpgradeModal} className="p-2 hover:bg-gray-200 rounded-full text-gray-400">
                <Icons.X size={20} />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Free Tier */}
              <div className="border border-gray-200 bg-white rounded-2xl p-6 flex flex-col">
                 <h4 className="font-bold text-gray-500 text-sm uppercase tracking-wide">Starter</h4>
                 <div className="mt-2 mb-4">
                    <span className="text-3xl font-bold text-gray-900">Free</span>
                 </div>
                 <button className="w-full py-2 rounded-lg border border-gray-300 font-bold text-gray-600 mb-6 cursor-default">Current Plan</button>
                 <ul className="space-y-3 text-sm text-gray-600 flex-1">
                    {features.filter(f => f.free).map(f => (
                      <li key={f.name} className="flex gap-2">
                        <Icons.Check size={16} className="text-teal-500 shrink-0" /> {f.name}
                      </li>
                    ))}
                 </ul>
              </div>

              {/* Pro Tier */}
              <div className="border-2 border-indigo-500 bg-white rounded-2xl p-6 flex flex-col relative shadow-xl shadow-indigo-100 transform md:-translate-y-2">
                 <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">Most Popular</div>
                 <h4 className="font-bold text-indigo-600 text-sm uppercase tracking-wide">Pro Student</h4>
                 <div className="mt-2 mb-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">$4.99</span>
                    <span className="text-gray-500 text-sm">/mo</span>
                 </div>
                 <button 
                   onClick={upgradeToPro}
                   className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold mb-6 shadow-lg shadow-indigo-200 transition-colors"
                 >
                   Upgrade Now
                 </button>
                 <ul className="space-y-3 text-sm text-gray-600 flex-1">
                    {features.map(f => (
                      <li key={f.name} className={`flex gap-2 ${!f.pro ? 'opacity-50' : ''}`}>
                        <Icons.Check size={16} className="text-indigo-500 shrink-0" /> 
                        <span className={f.pro && !f.free ? "font-semibold text-gray-800" : ""}>{f.name}</span>
                      </li>
                    ))}
                 </ul>
              </div>
           </div>
           
           <p className="text-center text-xs text-gray-400">
             Secure payment via Stripe. Cancel anytime. <br/>
             <a href="#" className="underline">Restore purchases</a>
           </p>
        </div>
      </div>
    </div>
  );
};