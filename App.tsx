
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { Message } from './types';
import { VoiceIndicator } from './components/VoiceIndicator';
import { OrderCard } from './components/OrderCard';

const gemini = new GeminiService();

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: "你好，我是 Nova。你可以说『帮我点份麦当劳』或者『寻找附近的意料餐厅』。" }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        null,
        { enableHighAccuracy: true }
      );
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    const content = text.trim();
    if (!content || isLoading) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: content }]);
    setIsLoading(true);
    setInput('');

    try {
      const response = await gemini.generateResponse(content, location);
      const assistantText = response.text || "已收到指令。";
      
      const assistantMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        text: assistantText 
      };

      if (response.functionCalls && response.functionCalls.length > 0) {
        const fc = response.functionCalls[0];
        if (fc.name === 'placeFoodOrder') {
          const args = fc.args as any;
          assistantMsg.type = 'order';
          assistantMsg.data = {
            ...args,
            total: args.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
            eta: '预计 35 分钟后送达'
          };
        }
      }
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        text: "连接超时，请确保环境变量中的 API_KEY 已正确配置。" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      if (input.length > 1) handleSend(input);
    } else {
      setIsListening(true);
      setInput('');
      // 模拟语音输入效果
      const demo = "帮我点一份附近评价最好的黄焖鸡米饭";
      let charIdx = 0;
      const interval = setInterval(() => {
        if (charIdx < demo.length) {
          setInput(prev => prev + demo[charIdx]);
          charIdx++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setIsListening(false);
            handleSend(demo);
          }, 800);
        }
      }, 60);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* 灵动岛风格页眉 */}
      <header className="px-6 pt-10 pb-4 shrink-0 flex items-center justify-between z-20">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_#3b82f6]"></div>
            <span className="font-bold text-lg tracking-tight">Nova</span>
          </div>
          <span className="text-[10px] text-white/30 tracking-[0.2em] font-medium uppercase mt-0.5">Quantum Intelligence</span>
        </div>
        <div className="w-10 h-10 rounded-2xl glass-panel flex items-center justify-center text-white/60">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-6.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-9.75 0h9.75" />
          </svg>
        </div>
      </header>

      {/* 消息区域 */}
      <main className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[88%] rounded-[20px] px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white font-medium rounded-tr-none' 
                : 'glass-panel text-white/90 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
            {msg.type === 'order' && <OrderCard order={msg.data} />}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 p-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* 底部交互区 */}
      <footer className="px-5 pt-2 pb-8 shrink-0 z-20 safe-area-bottom">
        <div className="glass-panel rounded-[28px] p-2 flex items-center gap-2 shadow-2xl border-white/5">
          <button 
            onClick={toggleListening}
            className={`w-12 h-12 rounded-[22px] flex items-center justify-center transition-all duration-500 ${
              isListening ? 'bg-red-500 shadow-[0_0_20px_#ef4444]' : 'bg-blue-600 shadow-[0_0_15px_#2563eb]'
            }`}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isListening ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder={isListening ? "正在倾听..." : "输入需求..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/20 px-3 text-[15px] outline-none"
          />

          {isListening ? (
            <VoiceIndicator isListening={isListening} />
          ) : (
            <button 
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className={`w-10 h-10 rounded-[18px] flex items-center justify-center transition-all ${
                input.trim() ? 'bg-white/10 text-white' : 'text-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
