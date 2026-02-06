import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Icons } from '../Icons';
import { aiOnboarding } from '../../src/services/AIOnboardingService';
import { notionDB } from '../../src/db/notionLikeDB';

interface Message {
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

export const AIGuidedOnboarding: React.FC = () => {
  const { user, completeOnboarding } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startOnboarding();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startOnboarding = async () => {
    if (!user) return;
    
    await notionDB.init();
    
    const { question, options: opts } = await aiOnboarding.startOnboarding(user.id);
    setOptions(opts || []);
    
    setMessages([{
      role: 'ai',
      content: question,
      timestamp: new Date()
    }]);
  };

  const handleSubmit = async () => {
    if (!answer && selectedOptions.length === 0) return;

    const userAnswer = selectedOptions.length > 0 ? selectedOptions : answer;
    const answerText = Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer;
    
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: answerText,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    setAnswer('');
    setSelectedOptions([]);

    try {
      const result = await aiOnboarding.processAnswer(userAnswer);
      
      // Add AI response
      setMessages(prev => [...prev, {
        role: 'ai',
        content: result.aiResponse || result.question,
        timestamp: new Date()
      }]);

      if (result.completed) {
        setIsComplete(true);
        setTimeout(() => {
          completeOnboarding({
            academicLevel: '',
            major: '',
            keyGoals: [],
            mobilePaired: false
          });
        }, 2000);
      } else {
        setOptions(result.options || []);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOption = (option: string) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-2xl h-[80vh] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-indigo-600/50 to-purple-600/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Icons.Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome to MindHangar!</h2>
              <p className="text-sm text-white/80">Let's personalize your learning journey</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-[10px] mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          {isComplete && (
            <div className="flex justify-center">
              <div className="bg-green-500/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-green-500/30 text-center">
                <Icons.Check size={32} className="text-green-400 mx-auto mb-2" />
                <p className="text-white font-bold">Onboarding Complete!</p>
                <p className="text-white/80 text-sm">Creating your personalized learning path...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!isComplete && (
          <div className="p-6 border-t border-white/20 bg-white/5 backdrop-blur-sm">
            {options.length > 0 ? (
              <div className="space-y-3">
                <p className="text-white text-sm font-medium mb-3">Choose one or more:</p>
                <div className="grid grid-cols-2 gap-2">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => toggleOption(option)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedOptions.includes(option)
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={selectedOptions.length === 0 || isLoading}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
                      <Icons.ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Type your answer..."
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none backdrop-blur-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Icons.ChevronRight size={20} />
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
