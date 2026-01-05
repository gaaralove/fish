
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { Message } from './types';
import { VoiceIndicator } from './components/VoiceIndicator';
import { OrderCard } from './components/OrderCard';

const gemini = new GeminiService();

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'start', role: 'assistant', text: "Nova 链路已建立。我是您的智能助手，您可以尝试说：『帮我点一份附近评价最好的披萨』。" }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', updateHeight);
    updateHeight();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        null, { enableHighAccuracy: true }
      );
    }
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAction = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || isLoading) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: prompt }]);
    setIsLoading(true);
    setInput('');

    try {
      const response = await gemini.generateResponse(prompt, location);
      const assistantText = response.text || "指令已解析并执行。";
      
      const newMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: assistantText };

      if (response.candidates?.[0]?.content?.parts) {
        const calls = response.functionCalls;
        if (calls && calls.length > 0 && calls[0].name === 'placeFoodOrder') {
          const args = calls[0].args as any;
          newMsg.type = 'order';
          newMsg.data = {
            ...args,
            total: args.items.reduce((a: number, c: any) => a + (c.price * c.quantity), 0),
            eta: '约 28 分钟送达'
          };
        }
      }
      setMessages(prev => [...prev, newMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        id: 'err', 
        role: 'assistant', 
        text: "同步失败。请检查 Vercel 环境变量 API_KEY 是否配置正确。" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateVoice = () => {
    if (isListening) {
      setIsListening(false);
      if (input.length > 2) handleAction(input);
    } else {
      setIsListening(true);
      setInput('');
      const demoText = "帮我点一份麦当劳巨无霸套餐送去公司";
      let i = 0;
      const t = setInterval(() => {
        if (i < demoText.length) {
          setInput(d => d + demoText[i]);
          i++;
        } else {
          clearInterval(t);
          setTimeout(() => { setIsListening(false); handleAction(demoText); }, 600);
        }
      }, 70);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* 顶部灵动岛 */}
      <header className="px-6 pt-12 pb-4 shrink-0 z-30">
        <div className="glass rounded-[24px] px-5 py-3 flex items-center justify-between border-white/5 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
              <div className="absolute w-5 h-5 rounded-full border border-blue-500/30 animate-ping"></div>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white uppercase">Nova Core</h1>
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-green-500"></span>
                <span className="text-[9px] text-white/40 font-mono">NEURAL_LINK_ACTIVE</span>
              </div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
          </div>
        </div>
      </header>

      {/* 消息流 */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-2 space-y-6 no-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[85%] px-5 py-3.5 rounded-[22px] text-[15px] leading-relaxed ${
              m.role === 'user' ? 'user-bubble text-white rounded-tr-none' : 'glass text-white/90 rounded-tl-none border-white/10'
            }`}>
              {m.text}
            </div>
            {m.type === 'order' && <OrderCard order={m.data} />}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-1.5 px-4 py-2 opacity-50">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
        <div className="h-4" />
      </main>

      {/* 底部控制器 */}
      <footer className="px-6 pt-2 pb-2 shrink-0 z-30 safe-pb">
        <div className="glass rounded-[32px] p-2 flex items-center gap-2 border-white/10 shadow-inner">
          <div className="relative">
            {isListening && <div className="energy-ring" style={{ width: '48px', height: '48px', top: '0', left: '0' }}></div>}
            <button 
              onClick={simulateVoice}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 z-10 relative ${
                isListening ? 'bg-red-500 rotate-90' : 'bg-blue-600 hover:scale-105'
              }`}
            >
              {isListening ? (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              )}
            </button>
          </div>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction(input)}
            placeholder={isListening ? "正在聆听..." : "输入指令..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/20 px-3 text-sm outline-none"
          />

          <button 
            onClick={() => handleAction(input)}
            disabled={!input.trim() || isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              input.trim() ? 'bg-white/10 text-blue-400' : 'text-white/5 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
