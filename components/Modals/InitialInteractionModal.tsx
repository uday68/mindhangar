import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generalInteractionAgent, StudentDetails } from '../../src/services/agents/GeneralInteractionAgent';
import { useStore } from '../../store/useStore';
import { notionDB } from '../../src/db/notionLikeDB';
import { Icons } from '../Icons';

interface InitialInteractionModalProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const InitialInteractionModal: React.FC<InitialInteractionModalProps> = ({ onComplete, onSkip }) => {
  const { user } = useStore();
  const [messages, setMessages] = useState<Array<{ role: 'agent' | 'user'; text: string }>>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Map conversation steps to progress numbers
  const getStepNumber = (step: string): number => {
    const stepMap: Record<string, number> = {
      'greeting': 0,
      'name': 1,
      'grade': 2,
      'board': 3,
      'subjects': 4,
      'goals': 5,
      'study_time': 6,
      'strengths': 7,
      'weaknesses': 8,
      'exam_date': 9,
      'confirmation': 10,
      'complete': 10
    };
    return stepMap[step] || 0;
  };

  const currentStep = generalInteractionAgent.getState().currentStep;
  const currentStepNumber = getStepNumber(currentStep);
  const totalSteps = 10;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Start conversation
    const initialMessage = generalInteractionAgent.start(user?.name);
    setMessages([{ role: 'agent', text: initialMessage }]);
    setQuickReplies(generalInteractionAgent.getQuickReplies());
    
    // Auto-focus input field
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [user?.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: messageText }]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Process response
    const response = generalInteractionAgent.processResponse(messageText);
    
    setMessages(prev => [...prev, { role: 'agent', text: response.message }]);
    setQuickReplies(generalInteractionAgent.getQuickReplies());
    setIsTyping(false);

    // Re-focus input after response
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    // If complete, save data and close
    if (response.isComplete && response.data) {
      await saveStudentProfile(response.data);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const saveStudentProfile = async (data: StudentDetails) => {
    if (!user) return;

    try {
      // Initialize notionDB
      await notionDB.init();

      // Save student profile
      await notionDB.saveStudent({
        id: user.id,
        name: data.fullName,
        email: user.email || '',
        grade: data.grade,
        board: data.board as 'CBSE' | 'ICSE' | 'State',
        goals: [],
        currentPath: null,
        preferences: {
          language: data.preferredLanguage || 'en',
          subjects: data.subjects,
          studyTime: data.studyTimePerDay,
          examDate: data.examDate ? new Date(data.examDate) : undefined
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Save goals
      for (const goalText of data.goals) {
        await notionDB.saveGoal({
          id: `goal_${Date.now()}_${Math.random()}`,
          title: goalText,
          description: '',
          type: 'subject',
          priority: 'high',
          status: 'active',
          progress: 0,
          milestones: [],
          createdAt: new Date()
        }, user.id);
      }

      console.log('✅ Student profile saved successfully');
    } catch (error) {
      console.error('❌ Failed to save student profile:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-indigo-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Icons.Sparkles size={24} />
              </div>
              <div>
                <h2 id="onboarding-title" className="text-xl font-bold">Welcome to MindHangar!</h2>
                <p className="text-sm text-white/90">Let's personalize your learning experience</p>
              </div>
            </div>
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Skip onboarding"
              >
                <Icons.X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        {currentStepNumber > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Step {currentStepNumber} of {totalSteps}</span>
              <span className="text-xs text-gray-500">{Math.round((currentStepNumber / totalSteps) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-teal-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-teal-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {quickReplies.length > 0 && (
          <div className="px-6 py-3 bg-white border-t border-gray-100" role="group" aria-label="Quick reply options">
            <p className="text-xs text-gray-500 mb-2">Quick replies:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(reply)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-teal-50 hover:text-teal-600 text-gray-700 rounded-full text-sm transition-colors border border-gray-200 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label={`Quick reply: ${reply}`}
                  type="button"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          {onSkip && (
            <div className="mb-3 text-center">
              <button
                onClick={onSkip}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Skip for now
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
            role="form"
            aria-label="Onboarding response form"
          >
            <input
              type="text"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={isTyping}
              aria-label="Your answer"
              aria-required="true"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Send answer"
            >
              <Icons.Check size={18} />
              Send
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
