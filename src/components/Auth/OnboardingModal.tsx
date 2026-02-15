import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Icons } from '../Icons';
import { LearnerProfile } from '../../types';
import { QrReader } from 'react-qr-reader';

export const OnboardingModal: React.FC = () => {
  const { completeOnboarding, user } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Form State
  const [profile, setProfile] = useState<LearnerProfile>({
    academicLevel: '',
    major: '',
    keyGoals: [],
    mobilePaired: false
  });
  const [goalInput, setGoalInput] = useState('');

  // Pairing State
  const [pairingStatus, setPairingStatus] = useState<'idle' | 'scanning' | 'connected'>('idle');
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scanData, setScanData] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1) {
      if (!profile.academicLevel || !profile.major) {
        alert("Please fill in your academic details.");
        return;
      }
    }
    setStep(prev => (prev + 1) as any);
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalInput.trim()) {
      setProfile(p => ({ ...p, keyGoals: [...p.keyGoals, goalInput.trim()] }));
      setGoalInput('');
    }
  };

  const simulatePairing = () => {
    setPairingStatus('scanning');
    setTimeout(() => {
      handlePairingSuccess("Simulated-Device-ID-123");
    }, 2000);
  };

  const handlePairingSuccess = (data: string) => {
    setScanData(data);
    setPairingStatus('connected');
    setProfile(p => ({ ...p, mobilePaired: true }));
    setIsScannerActive(false);
    setTimeout(() => {
      setStep(3);
    }, 1500);
  };

  const handleScan = (result: any, error: any) => {
    if (!!result) {
      // Success
      const text = result?.text || result?.getText?.();
      if (text) {
         handlePairingSuccess(text);
      }
    }
    if (!!error) {
      // console.info(error);
    }
  };

  const finish = () => {
    setIsAnimating(true);
    setTimeout(() => {
      completeOnboarding(profile);
    }, 500);
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
               <h2 className="text-3xl font-bold mb-2">Welcome, {user?.name?.split(' ')[0]}!</h2>
               <p className="text-teal-100">Let's set up your personalized MindHangar workspace.</p>
            </div>
            <div className="flex gap-2">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
              <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-white' : 'bg-white/30'}`} />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 flex-1 overflow-y-auto">
          
          {/* STEP 1: Learner Profile */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm">1</span>
                  Academic Profile
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Current Level</label>
                    <select 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      value={profile.academicLevel}
                      onChange={(e) => setProfile({...profile, academicLevel: e.target.value})}
                    >
                      <option value="">Select Level...</option>
                      <option value="High School">High School</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Self-Learner">Self-Learner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Major / Focus</label>
                    <input 
                      type="text"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="e.g. Computer Science"
                      value={profile.major}
                      onChange={(e) => setProfile({...profile, major: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-semibold text-gray-600 mb-2">Learning Goals</label>
                   <form onSubmit={addGoal} className="flex gap-2 mb-3">
                     <input 
                       className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                       placeholder="Add a goal (e.g. Master Calculus)"
                       value={goalInput}
                       onChange={(e) => setGoalInput(e.target.value)}
                     />
                     <button type="submit" className="bg-gray-800 text-white px-4 rounded-xl hover:bg-black transition-colors">
                       <Icons.Plus />
                     </button>
                   </form>
                   <div className="flex flex-wrap gap-2">
                     {profile.keyGoals.map((g, i) => (
                       <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100 flex items-center gap-2">
                         {g}
                         <button onClick={() => setProfile(p => ({...p, keyGoals: p.keyGoals.filter((_, idx) => idx !== i)}))} className="hover:text-indigo-900">×</button>
                       </span>
                     ))}
                   </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button onClick={handleNext} className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all flex items-center gap-2">
                  Next Step <Icons.ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Mobile Scanner */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">2</span>
                  Connect Mobile Monitor
                </h3>
               
               <div className="flex flex-col items-center justify-center py-4">
                  
                  {/* Scanner Area */}
                  <div className={`relative w-64 h-64 bg-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${pairingStatus === 'connected' ? 'border-4 border-green-500' : 'border-4 border-gray-200'}`}>
                    
                    {pairingStatus === 'connected' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-white text-green-600 animate-in zoom-in">
                        <Icons.Check size={64} />
                        <span className="font-bold mt-2">Paired Successfully!</span>
                        <p className="text-xs text-gray-400 mt-1">{scanData}</p>
                      </div>
                    ) : isScannerActive ? (
                      <div className="w-full h-full relative">
                        <QrReader
                          onResult={handleScan}
                          constraints={{ facingMode: 'user' }}
                          className="w-full h-full object-cover"
                          containerStyle={{ width: '100%', height: '100%', paddingTop: 0 }}
                          videoStyle={{ objectFit: 'cover' }}
                        />
                        {/* Overlay Frame */}
                        <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-lg pointer-events-none">
                          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-teal-500 -mt-1 -ml-1"></div>
                          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-teal-500 -mt-1 -mr-1"></div>
                          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-teal-500 -mb-1 -ml-1"></div>
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-teal-500 -mb-1 -mr-1"></div>
                        </div>
                        <button 
                          onClick={() => setIsScannerActive(false)} 
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-center p-4">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                          <Icons.MonitorPlay size={32} />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">Scan Mobile QR</h4>
                        <p className="text-xs text-gray-500 mt-2">Open the MindHangar app on your phone and hold its QR code up to this camera.</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="text-center mt-6 w-full max-w-sm">
                    {pairingStatus === 'idle' && !isScannerActive && (
                      <div className="space-y-3">
                        <button 
                          onClick={() => setIsScannerActive(true)} 
                          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                          <Icons.Eye size={18} /> Enable Camera Scanner
                        </button>
                        
                        <div className="relative py-2">
                           <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                           <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or</span></div>
                        </div>

                        <button 
                          onClick={simulatePairing} 
                          className="w-full bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          Simulate Connection (Demo)
                        </button>

                        <div className="mt-4">
                          <button onClick={() => setStep(3)} className="text-xs text-gray-400 hover:text-gray-600 underline">Skip for now</button>
                        </div>
                      </div>
                    )}
                    
                    {isScannerActive && (
                      <p className="text-indigo-600 font-medium text-sm animate-pulse mt-4">Searching for QR Code...</p>
                    )}
                  </div>
               </div>
            </div>
          )}

          {/* STEP 3: Complete */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center h-full py-10 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-100">
                 <Icons.Sparkles size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">You're All Set!</h2>
              <p className="text-gray-500 text-center max-w-md mb-8">
                Your workspace is optimized for <strong className="text-teal-600">{profile.major}</strong>. 
                {profile.mobilePaired && " Mobile monitoring is active."}
              </p>
              
              <button onClick={finish} className="w-full max-w-sm bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black hover:scale-105 transition-all shadow-xl">
                Enter Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};