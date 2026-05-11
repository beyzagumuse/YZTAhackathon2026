import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Sohbet geçmişini tuttuğumuz state
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Merhaba! Ben SmartOps yapay zeka asistanıyım. Siparişinizin durumunu veya stoklarımızı bana sorabilirsiniz.' }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Yeni mesaj geldiğinde otomatik en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    // Kullanıcının mesajını ekrana ekle
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Backend'deki /chat API'sine istek atıyoruz
      const res = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) throw new Error("Yapay zeka servisine ulaşılamadı.");

      const data = await res.json();
      // Gelen cevabı ekrana ekle
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'bot', text: "Üzgünüm, şu an sunucuya bağlanamıyorum. Lütfen terminalden backend'in çalıştığına emin olun." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* CHAT PENCERESİ */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-emerald-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <div>
                <h3 className="font-bold text-sm">SmartOps Asistan</h3>
                <p className="text-[10px] text-emerald-200">Çevrimiçi</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-emerald-200 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Mesajlaşma Alanı */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 text-sm rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Alanı */}
          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Sipariş numaranızı yazın..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 ring-emerald-100"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 disabled:bg-slate-300 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* AÇMA/KAPAMA BUTONU (Yüzen Buton) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}