"use client";
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

function generateSessionId() {
  return 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatWidget({ customerId }: { customerId?: string }) {
  const [open, setOpen] = useState(false);
  const sessionIdRef = useRef<string>(generateSessionId());
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Merhaba! Size nasıl yardımcı olabilirim? Sipariş durumu, ürün fiyatı veya stok hakkında sorabilirsiniz.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/chat/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, customer_id: customerId ?? null, session_id: sessionIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Sunucu hatası');
      setMessages(prev => [...prev, { role: 'bot', text: data.reply || 'Yanıt alınamadı.' }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'bot', text: err.message || 'Bağlantı hatası. Lütfen tekrar deneyin.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="Destek"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh' }}>

          {/* Header */}
          <div className="bg-emerald-600 px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm">SmartOps Asistan</p>
              <p className="text-emerald-100 text-[10px] font-medium">Sipariş · Stok · Kargo</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'bot' ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                  {msg.role === 'bot' ? <Bot size={14} className="text-emerald-600" /> : <User size={14} className="text-slate-600" />}
                </div>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'bot'
                    ? 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                    : 'bg-emerald-600 text-white rounded-br-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Bot size={14} className="text-emerald-600" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Mesajınızı yazın..."
              disabled={loading}
              className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 ring-emerald-500 disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
