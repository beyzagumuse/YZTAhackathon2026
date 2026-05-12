"use client";
import { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Truck, Box, MapPin, AlertCircle, Send, Bot, Loader2 } from 'lucide-react';

const mockData = [
  { name: 'Marmara', sevkiyat: 8200, anomali: false },
  { name: 'Ege', sevkiyat: 5100, anomali: false },
  { name: 'İç An.', sevkiyat: 6400, anomali: false },
  { name: 'Akdeniz', sevkiyat: 4800, anomali: false },
  { name: 'Karadeniz', sevkiyat: 3900, anomali: true },
];

type Model = 'gemini' | 'gemma';
interface Message { role: 'user' | 'bot'; text: string; }

const cleanMarkdown = (text: string) =>
  text.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1').replace(/#{1,6}\s/g, '').trim();

export default function AdminView() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Merhaba, ADMIN yetkisiyle bağlandınız. Sistem analizleri ve raporlamalar için hazırım.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<Model>('gemini');
  const sessionIdRef = useRef<string>('admin-' + Math.random().toString(36).slice(2));

  const handleAskAi = async () => {
    const text = chatInput.trim();
    if (!text || isLoading) return;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, model, session_id: sessionIdRef.current }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Sunucu hatası');
      setMessages(prev => [...prev, { role: 'bot', text: cleanMarkdown(data.reply || 'Yanıt alınamadı.') }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'bot', text: err.message || 'Bağlantı hatası.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Aktif Araç',      val: '3,120', color: 'text-blue-600',    icon: <Truck size={16}/> },
          { label: 'İşlemdeki Paket', val: '185k',  color: 'text-slate-800',   icon: <Box size={16}/> },
          { label: 'Varış Merkezi',   val: '412',   color: 'text-emerald-600', icon: <MapPin size={16}/> },
          { label: 'Kritik Anomali',  val: '03',    color: 'text-rose-600',    icon: <AlertCircle size={16}/> },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <div className={`${stat.color} opacity-20`}>{stat.icon}</div>
            </div>
            <p className={`text-4xl font-black ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-10 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div> Bölgesel Sevkiyat Hacmi
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="sevkiyat" radius={[15, 15, 0, 0]} barSize={60}>
                  {mockData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.anomali ? '#f43f5e' : '#2563eb'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 rounded-[48px] p-6 text-white flex flex-col shadow-2xl border-b-[16px] border-blue-600" style={{ maxHeight: '560px' }}>
          {/* Header + model toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_#3b82f6]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                {model === 'gemini' ? 'Gemini 2.5 Flash' : 'Gemma4:31B (Local)'}
              </span>
            </div>
            {isLoading && <Loader2 size={14} className="text-blue-500 animate-spin" />}
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setModel('gemini')}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${model === 'gemini' ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}>
              Gemini
            </button>
            <button onClick={() => setModel('gemma')}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${model === 'gemma' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}>
              Gemma4
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                    <Bot size={12} className="text-blue-400" />
                  </div>
                )}
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'bot'
                    ? 'bg-white/10 text-blue-100 rounded-bl-sm'
                    : 'bg-blue-600 text-white rounded-br-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 flex items-center justify-center">
                  <Bot size={12} className="text-blue-400" />
                </div>
                <div className="bg-white/10 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskAi()}
              placeholder="Rapor iste veya stok sor..."
              disabled={isLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 ring-blue-500 text-white placeholder:text-slate-500 disabled:opacity-50"
            />
            <button onClick={handleAskAi} disabled={isLoading || !chatInput.trim()}
              className="w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center transition-all disabled:opacity-40">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
