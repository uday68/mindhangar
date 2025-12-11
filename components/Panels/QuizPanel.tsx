import React, { useState } from 'react';
import { generateQuizQuestions, generateFlashcards, generatePerformanceReview } from '../../services/geminiService';
import { QuizQuestion, Flashcard } from '../../types';
import { useStore } from '../../store/useStore';
import { Icons } from '../Icons';

export const QuizPanel: React.FC = () => {
  const { addXp, settings } = useStore();
  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcards'>('quiz');
  
  // Quiz State
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  // Reflection / Coaching State
  const [reflectionConfidence, setReflectionConfidence] = useState(5);
  const [reflectionText, setReflectionText] = useState('');
  const [coachingLoading, setCoachingLoading] = useState(false);
  const [coachingResult, setCoachingResult] = useState<{
    diagnosis: string;
    technique: string;
    technique_description: string;
    action_plan: string[];
  } | null>(null);

  // Flashcard State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!topic || !settings.apiKey) return;
    setQuizLoading(true);
    setQuestions([]);
    setAnswers({});
    setShowResults(false);
    setCoachingResult(null); // Reset previous coaching
    setReflectionText('');
    setReflectionConfidence(5);
    
    const qs = await generateQuizQuestions(settings.apiKey, topic, difficulty);
    setQuestions(qs);
    setQuizLoading(false);
  };

  const handleGenerateFlashcards = async () => {
    if (!topic || !settings.apiKey) return;
    setFlashcardLoading(true);
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);

    const cards = await generateFlashcards(settings.apiKey, topic);
    setFlashcards(cards);
    setFlashcardLoading(false);
  };

  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = () => {
    setShowResults(true);
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) score++;
    });
    // Award XP based on score
    addXp(score * 10);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) score++;
    });
    return score;
  };

  const handleGetCoaching = async () => {
    if (!reflectionText || !settings.apiKey) return;
    setCoachingLoading(true);
    const result = await generatePerformanceReview(settings.apiKey, {
      topic: topic,
      confidence: reflectionConfidence,
      confusion: reflectionText
    });
    setCoachingResult(result);
    setCoachingLoading(false);
  };

  // Shared Header
  const Header = () => (
    <div className="flex items-center justify-center gap-1 bg-gray-100 p-1 rounded-lg mb-4">
      <button 
        onClick={() => setActiveTab('quiz')}
        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'quiz' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
      >
        Quiz Mode
      </button>
      <button 
        onClick={() => setActiveTab('flashcards')}
        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'flashcards' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
      >
        Flashcards
      </button>
    </div>
  );

  if (!settings.apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Icons.Settings className="text-gray-400 mb-2" size={32} />
        <h3 className="font-bold text-gray-700">API Key Required</h3>
        <p className="text-xs text-gray-500 mb-4">Please configure your Gemini API Key in Settings to generate quizzes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header />

      {/* --- QUIZ MODE --- */}
      {activeTab === 'quiz' && (
        <>
          {questions.length === 0 && (
            <div className="flex flex-col gap-4 m-auto w-full max-w-xs text-center">
              <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icons.Brain size={32} />
              </div>
              <h3 className="text-gray-800 font-semibold">Generate a Quiz</h3>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Topic (e.g. Photosynthesis)"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
              <div className="flex gap-2 justify-center">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button 
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1 rounded-md text-xs font-medium capitalize border ${difficulty === d ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleGenerateQuiz}
                disabled={quizLoading || !topic}
                className="w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {quizLoading ? <span className="animate-spin w-4 h-4 border-2 border-white/50 border-t-white rounded-full"/> : "Start Quiz"}
              </button>
            </div>
          )}

          {questions.length > 0 && (
            <div className="flex flex-col h-full overflow-y-auto pr-1 space-y-6">
               <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="font-bold text-gray-700 capitalize">{topic} Quiz</h3>
                <button onClick={() => setQuestions([])} className="text-xs text-gray-400 hover:text-gray-600">Exit</button>
              </div>
              {questions.map((q, qIdx) => {
                const isCorrect = answers[qIdx] === q.correctIndex;
                return (
                  <div key={qIdx} className="bg-white/50 p-4 rounded-xl border border-white shadow-sm">
                    <p className="text-sm font-medium text-gray-800 mb-3">{qIdx + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        let btnClass = "border-gray-200 hover:bg-gray-50";
                        if (showResults) {
                          if (optIdx === q.correctIndex) btnClass = "bg-green-100 border-green-300 text-green-800";
                          else if (answers[qIdx] === optIdx) btnClass = "bg-red-50 border-red-200 text-red-800";
                        } else if (answers[qIdx] === optIdx) {
                          btnClass = "bg-indigo-50 border-indigo-300 text-indigo-700";
                        }
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleAnswer(qIdx, optIdx)}
                            disabled={showResults}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${btnClass}`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                );
              })}
              {!showResults ? (
                <button 
                  onClick={submitQuiz}
                  className="w-full bg-indigo-600 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                >
                  Submit Answers
                </button>
              ) : (
                <div className="space-y-6 pb-6">
                  {/* Score Card */}
                  <div className="text-center p-4 bg-teal-50 rounded-xl border border-teal-100">
                    <span className="text-teal-900 font-bold text-lg">Score: {calculateScore()} / {questions.length}</span>
                    <p className="text-xs text-teal-600 mt-1">+{(calculateScore() * 10)} XP Earned!</p>
                  </div>

                  {/* Reflection & AI Coaching Section */}
                  <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
                      <Icons.Brain size={18} /> AI Coach Reflection
                    </h4>
                    
                    {!coachingResult ? (
                      <div className="space-y-3">
                        <p className="text-xs text-indigo-700 leading-relaxed">
                          Take a second to reflect. Identifying what confused you is the fastest way to learn.
                        </p>
                        
                        <div>
                          <label className="text-xs font-bold text-indigo-400 uppercase">Confidence Level</label>
                          <div className="flex items-center gap-3">
                             <input 
                               type="range" min="1" max="10" 
                               value={reflectionConfidence} 
                               onChange={(e) => setReflectionConfidence(parseInt(e.target.value))}
                               className="flex-1 accent-indigo-600 h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
                             />
                             <span className="text-xs font-bold text-indigo-700 w-6">{reflectionConfidence}</span>
                          </div>
                        </div>

                        <div>
                           <label className="text-xs font-bold text-indigo-400 uppercase">What was confusing?</label>
                           <textarea
                             value={reflectionText}
                             onChange={(e) => setReflectionText(e.target.value)}
                             placeholder="e.g. I guessed on question 2 because I forgot..."
                             className="w-full mt-1 p-2 rounded-lg border border-indigo-100 text-sm h-20 resize-none focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                           />
                        </div>

                        <button 
                          onClick={handleGetCoaching}
                          disabled={coachingLoading || !reflectionText}
                          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                          {coachingLoading ? <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full"/> : "Get Coaching"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                         {/* Diagnosis */}
                         <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Analysis</span>
                            <p className="text-sm text-gray-800 font-medium leading-relaxed mt-1">{coachingResult.diagnosis}</p>
                         </div>
                         
                         {/* Strategy */}
                         <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                            <span className="text-[10px] font-bold text-teal-600 uppercase">Try This Strategy</span>
                            <h5 className="font-bold text-teal-800 text-sm mt-0.5">{coachingResult.technique}</h5>
                            <p className="text-xs text-teal-700 mt-1 leading-relaxed">{coachingResult.technique_description}</p>
                         </div>

                         <div className="pt-2">
                           <button onClick={() => setQuestions([])} className="w-full text-xs text-gray-400 hover:text-gray-600 underline">Close Quiz</button>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* --- FLASHCARD MODE --- */}
      {activeTab === 'flashcards' && (
        <>
          {flashcards.length === 0 && (
             <div className="flex flex-col gap-4 m-auto w-full max-w-xs text-center">
               <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                 <Icons.FileText size={32} />
               </div>
               <h3 className="text-gray-800 font-semibold">Generate Flashcards</h3>
               <input 
                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="Topic (e.g. Spanish Verbs)"
                 value={topic}
                 onChange={e => setTopic(e.target.value)}
               />
               <button 
                 onClick={handleGenerateFlashcards}
                 disabled={flashcardLoading || !topic}
                 className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
               >
                 {flashcardLoading ? <span className="animate-spin w-4 h-4 border-2 border-white/50 border-t-white rounded-full"/> : "Create Deck"}
               </button>
             </div>
          )}

          {flashcards.length > 0 && (
            <div className="flex flex-col h-full items-center justify-center relative">
               <div className="absolute top-0 right-0 left-0 flex justify-between items-center pb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Card {currentCardIndex + 1} / {flashcards.length}</span>
                  <button onClick={() => setFlashcards([])} className="text-xs text-red-400 hover:text-red-600">Close</button>
               </div>

               {/* Flip Card Container */}
               <div 
                 className="w-full aspect-[4/3] perspective-1000 cursor-pointer group"
                 onClick={() => setIsFlipped(!isFlipped)}
               >
                 <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-white border-2 border-indigo-100 rounded-2xl shadow-xl flex items-center justify-center p-8 text-center" style={{ backfaceVisibility: 'hidden' }}>
                       <div>
                          <span className="block text-xs text-indigo-400 font-bold uppercase mb-4">Front</span>
                          <h3 className="text-xl font-medium text-gray-800">{flashcards[currentCardIndex].front}</h3>
                          <p className="absolute bottom-4 left-0 w-full text-center text-xs text-gray-400">Click to flip</p>
                       </div>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden bg-indigo-600 rounded-2xl shadow-xl flex items-center justify-center p-8 text-center text-white rotate-y-180" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                       <div>
                          <span className="block text-xs text-indigo-200 font-bold uppercase mb-4">Back</span>
                          <h3 className="text-lg font-medium leading-relaxed">{flashcards[currentCardIndex].back}</h3>
                       </div>
                    </div>
                 </div>
               </div>

               {/* Controls */}
               <div className="flex gap-4 mt-8 w-full">
                  <button 
                    onClick={() => {
                      if (currentCardIndex > 0) {
                        setIsFlipped(false);
                        setTimeout(() => setCurrentCardIndex(curr => curr - 1), 200);
                      }
                    }}
                    disabled={currentCardIndex === 0}
                    className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
                  >
                    Prev
                  </button>
                  <button 
                    onClick={() => {
                      if (currentCardIndex < flashcards.length - 1) {
                         setIsFlipped(false);
                         setTimeout(() => setCurrentCardIndex(curr => curr + 1), 200);
                         // Award small XP for flipping through
                         if (isFlipped) addXp(2);
                      } else {
                         // Finished deck
                         addXp(20);
                         alert("Deck Complete! +20 XP");
                         setFlashcards([]);
                      }
                    }}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
                  >
                    {currentCardIndex === flashcards.length - 1 ? 'Finish' : 'Next'}
                  </button>
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};