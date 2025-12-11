import React, { useState, useEffect, useRef } from 'react';
import { createChatSession } from '../../services/geminiService';
import { Icons } from '../Icons';

export const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = createChatSession();
    // Initial Greeting
    setMessages([{ role: 'model', text: "Hi! I'm your AI study assistant. How can I help you focus today?" }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessageStream(userMsg);
      
      let fullText = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]); // Placeholder

      for await (const chunk of result) {
        const text = chunk.text();
        fullText += text;
        setMessages(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', text: fullText };
          return newHistory;
        });
      }
      
      // Auto-read response if simple enough
      if (fullText.length < 200) {
        // Optional: auto-speak short responses
        // speakText(fullText);
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed relative group ${
                msg.role === 'user' 
                  ? 'bg-teal-600 text-white rounded-br-none shadow-md shadow-teal-900/10' 
                  : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text}
              
              {/* Speak Button for AI messages */}
              {msg.role === 'model' && (
                <button 
                  onClick={() => speakText(msg.text)}
                  className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 transition-all p-1"
                  title="Read aloud"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-2 flex items-center gap-2">
        {isSpeaking && (
          <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-lg p-2 flex justify-between items-center">
             <div className="flex gap-1 items-center">
               <div className="w-1 h-3 bg-indigo-400 animate-pulse"></div>
               <div className="w-1 h-5 bg-indigo-500 animate-pulse delay-75"></div>
               <div className="w-1 h-2 bg-indigo-400 animate-pulse delay-150"></div>
               <span className="text-xs text-indigo-700 ml-2 font-medium">Assistant speaking...</span>
             </div>
             <button onClick={stopSpeaking} className="text-xs text-red-500 font-bold px-2 hover:bg-red-50 rounded">Stop</button>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-2 relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Type a message..."
          className="w-full bg-white border border-gray-200 pl-4 pr-12 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:bg-gray-300"
        >
          <Icons.Check size={16} />
        </button>
      </form>
    </div>
  );
};