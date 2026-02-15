/**
 * Course Creation Chat Modal
 * Interactive conversational interface for creating courses with AI guidance
 */

import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../Icons';
import { courseCreationAgent, ConversationState } from '../../services/agents/CourseCreationAgent';
import { useCourseStore } from '@/store/useCourseStore';

interface CourseCreationChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (courseId: string) => void;
}

export const CourseCreationChatModal: React.FC<CourseCreationChatModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated
}) => {
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addCourse, userProfile } = useCourseStore();

  // Initialize conversation when modal opens
  useEffect(() => {
    if (isOpen && !conversationState) {
      const initialState = courseCreationAgent.startConversation();
      setConversationState(initialState);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationState?.conversationHistory]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !conversationState || isProcessing) return;

    setIsProcessing(true);

    try {
      // Check if user wants to confirm and create course
      if (userInput.toLowerCase().includes('yes') && conversationState.step === 9) {
        await handleCreateCourse();
        return;
      }

      // Process the user's response
      const newState = await courseCreationAgent.processResponse(
        conversationState,
        userInput
      );

      setConversationState(newState);
      setUserInput('');

      // If conversation is complete, create the course
      if (newState.isComplete) {
        await handleCreateCourse();
      }
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!conversationState) return;

    setIsCreatingCourse(true);

    try {
      const { courseGenerator } = await import('@/src/services/CourseGeneratorService');
      
      const profile = userProfile || {
        interests: [conversationState.requirements.topic || ''],
        goals: conversationState.requirements.learningObjectives || [],
        currentLevel: conversationState.requirements.level || 'beginner',
        preferredLanguage: conversationState.requirements.preferredLanguage || 'en',
        learningStyle: 'visual' as const,
        timeCommitment: Math.ceil((conversationState.requirements.duration || 20) / 4)
      };

      const course = await courseGenerator.generateCourse(
        conversationState.requirements.topic || 'General Course',
        profile,
        conversationState.requirements.moduleCount || 5
      );

      addCourse(course);
      onCourseCreated(course.id);
      
      // Add success message
      setConversationState(prev => prev ? {
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory,
          {
            id: `msg-${Date.now()}`,
            role: 'agent',
            content: `🎉 Success! Your course "${course.title}" has been created with ${course.modules.length} modules. You can start learning right away!`,
            timestamp: new Date()
          }
        ]
      } : null);

      // Close modal after a short delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error creating course:', error);
      setConversationState(prev => prev ? {
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory,
          {
            id: `msg-${Date.now()}`,
            role: 'agent',
            content: '❌ Sorry, there was an error creating your course. Please try again.',
            timestamp: new Date()
          }
        ]
      } : null);
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleClose = () => {
    setConversationState(null);
    setUserInput('');
    setIsProcessing(false);
    setIsCreatingCourse(false);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = (reply: string) => {
    setUserInput(reply);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Quick reply suggestions based on current step
  const getQuickReplies = (): string[] => {
    if (!conversationState) return [];

    const step = conversationState.step;
    
    switch (step) {
      case 2: // Level
        return ['Beginner', 'Intermediate', 'Advanced'];
      case 4: // Duration
        return ['Quick course', 'Standard course', 'Comprehensive course'];
      case 7: // Language
        return ['English', 'Hindi', 'Telugu'];
      case 8: // Content preferences
        return ['Yes, include both', 'Only quizzes', 'Only projects'];
      case 9: // Confirmation
        return ['Yes, create it!', 'Modify'];
      default:
        return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
              <Icons.Brain size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Course Creator</h2>
              <p className="text-xs text-blue-100">Let's build your perfect course together</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isCreatingCourse}
          >
            <Icons.X size={20} className="text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {conversationState?.conversationHistory.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                {message.role === 'agent' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.Brain size={16} className="text-blue-600" />
                    <span className="text-xs font-semibold text-blue-600">AI Assistant</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Icons.Loader size={16} className="text-blue-600 animate-spin" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {isCreatingCourse && (
            <div className="flex justify-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <Icons.Sparkles size={32} className="text-blue-600 mx-auto mb-3 animate-pulse" />
                <p className="text-sm font-medium text-blue-900">Creating your course...</p>
                <p className="text-xs text-blue-700 mt-1">This may take a moment</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {getQuickReplies().length > 0 && !isProcessing && !isCreatingCourse && (
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {getQuickReplies().map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-sm text-gray-700 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isProcessing || isCreatingCourse}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isProcessing || isCreatingCourse}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <Icons.Loader size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Icons.ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};
