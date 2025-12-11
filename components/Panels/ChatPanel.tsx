import React, { useState, useEffect, useRef } from 'react';
import { createChatSession } from '../../services/geminiService';
import { useStore } from '../../store/useStore';
import { Icons } from '../Icons';

// Helper to convert file to Base64 (Images)
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// Helper to read text files
const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const ChatPanel: React.FC = () => {
  const { settings, currentTranscript, pages, activePageId, user } = useStore();
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string, image?: string, fileName?: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Attachment state now tracks type
  const [attachment, setAttachment] = useState<{file: File, preview: string, type: 'image' | 'file'} | null>(null);
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings.apiKey) {
      const session = createChatSession(settings.apiKey);
      if (session) {
        chatSessionRef.current = session;
        setMessages([{ role: 'model', text: "Hi! I'm your AI study assistant. I can see your current notes and video transcript to help you better." }]);
      } else {
        setMessages([{ role: 'model', text: "Please configure your API Key in Settings to start chatting." }]);
      }
    } else {
      setMessages([{ role: 'model', text: "Please configure your API Key in Settings to start chatting." }]);
    }
  }, [settings.apiKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, attachment]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setAttachment({
            file,
            preview: ev.target?.result as string,
            type: 'image'
          });
        };
        reader.readAsDataURL(file);
      } else {
        // Text/Code/Other
        setAttachment({
          file,
          preview: '', // No preview for files
          type: 'file'
        });
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachment) || !chatSessionRef.current) return;

    const userMsg = input;
    const currentAttachment = attachment;
    
    // Clear Input Immediately
    setInput('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Add User Message to UI
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userMsg, 
      image: currentAttachment?.type === 'image' ? currentAttachment.preview : undefined,
      fileName: currentAttachment?.type === 'file' ? currentAttachment.file.name : undefined
    }]);
    setLoading(true);

    try {
      let result;
      
      // Build Context (RAG-lite)
      let contextInjection = "";
      if (currentTranscript && user?.isPro) {
        contextInjection += `\n[CONTEXT: Current Video Transcript snippet]: "${currentTranscript.substring(0, 1000)}..."\n`;
      }
      if (activePageId && pages[activePageId] && user?.isPro) {
         contextInjection += `\n[CONTEXT: Currently Open Note Title]: "${pages[activePageId].title}"\n`;
      }

      if (currentAttachment) {
        if (currentAttachment.type === 'image') {
          // Multimodal Image Request
          const imagePart = await fileToGenerativePart(currentAttachment.file);
          result = await chatSessionRef.current.sendMessageStream([userMsg + contextInjection || "Explain this image.", imagePart]);
        } else {
          // Text File Request
          const textContent = await fileToText(currentAttachment.file);
          const prompt = `
            [System: The user has attached a file named "${currentAttachment.file.name}". Use its content below to answer their request.]
            ${contextInjection}
            
            --- BEGIN FILE CONTENT ---
            ${textContent.substring(0, 30000)} 
            --- END FILE CONTENT ---

            User Request: ${userMsg || "Summarize this file."}
          `;
          result = await chatSessionRef.current.sendMessageStream(prompt);
        }
      } else {
        // Text Only Request with Context
        const prompt = contextInjection ? `${contextInjection}\nUser: ${userMsg}` : userMsg;
        result = await chatSessionRef.current.sendMessageStream(prompt);
      }
      
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
      
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I couldn't process that. If you uploaded a file, ensure it is a text-based format (txt, md, csv, code)." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-20">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed relative group shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-teal-600 text-white rounded-br-none' 
                  : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
              }`}
            >
              {msg.image && (
                <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                  <img src={msg.image} alt="User upload" className="max-w-full h-auto max-h-48 object-cover" />
                </div>
              )}

              {msg.fileName && (
                <div className="mb-2 flex items-center gap-2 bg-black/10 rounded p-2 text-xs font-mono">
                  <Icons.FileText size={14} />
                  <span className="truncate max-w-[150px]">{msg.fileName}</span>
                </div>
              )}
              
              <div className="whitespace-pre-wrap">{msg.text}</div>
              
              {msg.role === 'model' && (
                <div className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                   <button 
                    onClick={() => speakText(msg.text)}
                    className="text-gray-400 hover:text-indigo-600 p-1 bg-white rounded-full shadow-sm"
                    title="Read aloud"
                  >
                    <Icons.Video size={14} /> 
                  </button>
                </div>
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

      <div className="mt-auto bg-white/80 backdrop-blur pt-2 border-t border-gray-100">
        {/* Context Badge (Commercial Feature) */}
        {(currentTranscript || activePageId) && (
          <div className="px-2 pb-2 flex items-center gap-2">
             <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-teal-100">
                <Icons.Sparkles size={8} /> Context Aware Active
             </span>
             {currentTranscript && <span className="text-[9px] text-gray-400">Reading Video</span>}
          </div>
        )}

        {/* Attachment Preview */}
        {attachment && (
          <div className="px-2 pb-2 flex items-center">
            <div className="relative group bg-gray-50 rounded-lg p-2 border border-gray-200 flex items-center gap-3">
              {attachment.type === 'image' ? (
                <img src={attachment.preview} alt="Preview" className="h-10 w-10 object-cover rounded shadow-sm" />
              ) : (
                <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center">
                  <Icons.FileText size={20} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{attachment.file.name}</span>
                <span className="text-[10px] text-gray-400 uppercase">{attachment.file.type || 'File'}</span>
              </div>
              <button 
                onClick={() => { setAttachment(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                className="ml-2 text-gray-400 hover:text-red-500"
              >
                <Icons.X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2 px-1">
           {isSpeaking && (
              <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-lg p-2 flex justify-between items-center animate-in slide-in-from-bottom-2">
                 <div className="flex gap-1 items-center">
                   <div className="w-1 h-3 bg-indigo-400 animate-pulse"></div>
                   <div className="w-1 h-5 bg-indigo-500 animate-pulse delay-75"></div>
                   <div className="w-1 h-2 bg-indigo-400 animate-pulse delay-150"></div>
                   <span className="text-xs text-indigo-700 ml-2 font-medium">Reading...</span>
                 </div>
                 <button onClick={stopSpeaking} className="text-xs text-red-500 font-bold px-2 hover:bg-red-50 rounded">Stop</button>
              </div>
           )}
        </div>

        <form onSubmit={handleSend} className="relative flex gap-2 items-center">
          <input 
            type="file" 
            ref={fileInputRef}
            // Accept images AND standard text/code formats
            accept="image/*, .txt, .md, .csv, .json, .js, .jsx, .ts, .tsx, .py, .java, .c, .cpp, .html, .css, .vtt, .srt"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-xl transition-colors ${attachment ? 'text-teal-600 bg-teal-50' : 'text-gray-400 hover:text-teal-600 hover:bg-gray-100'}`}
            title="Attach Image or File"
          >
            {/* Paperclip Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>

          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={settings.apiKey ? (attachment ? "Type instructions..." : "Ask Gemini...") : "Enter API Key..."}
            className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner disabled:opacity-50"
          />
          
          <button 
            type="submit"
            disabled={(!input.trim() && !attachment) || loading || !settings.apiKey}
            className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50 disabled:bg-gray-300 shadow-lg shadow-teal-100"
          >
            <Icons.Check size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};