import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import QuickActions from './components/QuickActions';
import { Message, Role } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: "Hello! I'm the AI assistant for Assam Down Town University (AdtU). \n\nI can help you with admissions, courses, fees, and campus updates. Please verify critical info on the official website.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create a placeholder message for the AI response
      const aiMessageId = (Date.now() + 1).toString();
      const initialAiMessage: Message = {
        id: aiMessageId,
        role: Role.MODEL,
        text: '',
        isStreaming: true,
      };
      
      setMessages((prev) => [...prev, initialAiMessage]);

      let fullResponse = '';
      let accumulatedMetadata: any = null;

      const stream = geminiService.sendMessageStream(text);

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        
        // Update metadata if received in this chunk
        if (chunk.groundingMetadata) {
          accumulatedMetadata = chunk.groundingMetadata;
        }

        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === aiMessageId 
              ? { 
                  ...msg, 
                  text: fullResponse,
                  groundingMetadata: accumulatedMetadata || msg.groundingMetadata 
                } 
              : msg
          )
        );
      }

      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === aiMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: Role.MODEL,
        text: "I apologize, but I encountered an error connecting to the campus network.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Keep focus on input for desktop
      if (window.matchMedia('(min-width: 768px)').matches) {
          inputRef.current?.focus();
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          {/* Messages */}
          <div className="flex-1">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 z-10">
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-3">
             <QuickActions onQuestionSelect={(text) => handleSendMessage(text)} disabled={isLoading} />
          </div>

          <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about admissions, hostels, or courses..."
                disabled={isLoading}
                className="w-full pl-5 pr-12 py-3.5 bg-slate-100 border-none rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all shadow-inner"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-[-45deg] translate-x-0.5 -translate-y-0.5">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">
              AI generated responses. Check the official AdtU website for critical updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;