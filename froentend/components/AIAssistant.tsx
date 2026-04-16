'use client';

import React, { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello, beautiful soul. I am here to help you navigate the Echo landscape. How can I assist you today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const apiMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage.content }
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage =
          errorData?.error ||
          `${res.status} ${res.statusText}` ||
          'Unknown API error';

        throw new Error(`API Error: ${errorMessage}`);
      }

      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply
        }
      ]);
    } catch (error) {
      console.error('AI assistant request failed:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble connecting to the void. Please try again later."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Inline styles needed for the specific UI elements from the HTML
  const aiGradient = { background: 'linear-gradient(135deg, #534AB7 0%, #AFA9EC 100%)' };
  const soulGradient = { background: 'linear-gradient(135deg, #3B309E 0%, #534AB7 100%)' };

  return (
    <>
      {/* Floating AI Assistant Button (FAB) */}
      <div className="fixed bottom-[114px] right-6 z-50">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-[56px] h-[56px] rounded-full flex items-center justify-center text-white shadow-[0_12px_32px_rgba(83,74,183,0.3)] hover:scale-110 active:scale-90 transition-all duration-300 relative group border-2 border-[#534AB7]"
        >
          {/* Pulse Glow Effect */}
          <span className="absolute inset-0 rounded-full bg-[#534AB7] animate-ping opacity-20 group-hover:hidden"></span>
          <img 
            src="/poison%20tree.jpg" 
            alt="AI Assistant" 
            className="w-full h-full object-cover rounded-full" 
          />
        </button>
      </div>

      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* AI Chat Drawer (Bottom Sheet) */}
      <div 
        className={`fixed inset-x-0 bottom-0 h-[70vh] z-[60] bg-[#f5f4ef] rounded-t-[3rem] shadow-2xl flex flex-col border-t border-white/20 transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Drawer Header */}
        <div className="px-8 pt-8 pb-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-[#534AB7]/20"
              style={aiGradient}
            >
              <img 
                src="/poison%20tree.jpg" 
                alt="Echo Guide Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#3b309e] tracking-tight font-headline">Echo Guide</h3>
              <p className="text-xs text-[#474553] font-medium opacity-70">Your anonymous companion</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full bg-[#e3e3de] flex items-center justify-center text-[#3b309e] hover:bg-[#efeee9] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-8 space-y-6 pb-[100px]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div 
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#534AB7]/20"
                  style={aiGradient}
                >
                  <img src="/poison%20tree.jpg" alt="AI" className="w-full h-full object-cover z-10" />
                </div>
              )}
              
              <div 
                className={`p-4 rounded-2xl shadow-sm max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'rounded-tr-none text-white' 
                    : 'bg-[#ffffff] rounded-tl-none text-[#1b1c19]'
                }`}
                style={msg.role === 'user' ? soulGradient : {}}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div 
                className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={aiGradient}
              >
                <img src="/poison%20tree.jpg" alt="AI" className="w-full h-full object-cover" />
              </div>
              <div className="bg-[#ffffff] p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center justify-center h-[52px]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#534AB7] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#534AB7] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#534AB7] animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Fixed to bottom of drawer) */}
        <div className="absolute bottom-0 inset-x-0 p-6 bg-[#f5f4ef]/95 backdrop-blur-md pb-8 rounded-b-[3rem]">
          <div className="relative flex items-center">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#ffffff] border-none rounded-full py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-[#3b309e]/20 placeholder:text-[#474553]/40 text-[#1b1c19]" 
              placeholder="Ask anything..." 
              type="text" 
            />
            <button 
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className={`absolute right-2 w-10 h-10 text-white rounded-full flex items-center justify-center shadow-lg transition-transform ${inputText.trim() && !isLoading ? 'active:scale-90 opacity-100' : 'opacity-50'}`}
              style={soulGradient}
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
