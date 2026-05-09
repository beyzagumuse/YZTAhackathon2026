import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Truck, Box, MapPin, AlertCircle, MessageSquare, Loader2 } from 'lucide-react';

const mockData = [
  { name: 'Marmara', sevkiyat: 8200, anomali: false },
  { name: 'Ege', sevkiyat: 5100, anomali: false },
  { name: 'İç An.', sevkiyat: 6400, anomali: false },
  { name: 'Akdeniz', sevkiyat: 4800, anomali: false },
  { name: 'Karadeniz', sevkiyat: 3900, anomali: true }, 
];

export default function AdminView() {
  const [aiText, setAiText] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const streamText = (text: string) => {
    let index = 0;
    setAiText(""); 
    const interval = setInterval(() => {
      setAiText((prev) => prev + text[index]);
      index++;
      if (index >= text.length - 1) clearInterval(interval);
    }, 20);
  };

  useEffect(() => {
    streamText("Merhaba, ADMIN yetkisiyle bağlandınız. Sistem analizleri ve raporlamalar için hazırım.");
  }, []);

  const handleAskAi = async () => {
    if (!chatInput.trim()) return;
    setIsLoading(true); setAiText(""); 
    try {
      const response = await fetch("http://localhost:8000/chat/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput })
      });
      const data = await response.json();
      streamText(data.reply || "Yanıt alınamadı.");
    } catch {
      streamText("Bağlantı hatası: Backend sunucusuna ulaşılamıyor.");
    } finally {
      setIsLoading(false); setChatInput(""); 
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Aktif Araç', val: '3,120', color: 'text-blue-600', icon: <Truck size={16}/> },
          { label: 'İşlemdeki Paket', val: '185k', color: 'text-slate-800', icon: <Box size={16}/> },
          { label: 'Varış Merkezi', val: '412', color: 'text-emerald-600', icon: <MapPin size={16}/> },
          { label: 'Kritik Anomali', val: '03', color: 'text-rose-600', icon: <AlertCircle size={16}/> }
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
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="sevkiyat" radius={[15, 15, 0, 0]} barSize={60}>
                  {mockData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.anomali ? '#f43f5e' : '#2563eb'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 rounded-[48px] p-10 text-white flex flex-col shadow-2xl border-b-[16px] border-blue-600">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_#3b82f6]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Gemini Neural Engine</span>
            </div>
            {isLoading && <Loader2 size={16} className="text-blue-500 animate-spin" />}
          </div>
          
          <div className="flex-1 bg-white/5 rounded-[32px] p-8 mb-8 font-mono text-[12px] leading-relaxed text-blue-100 border border-white/5 overflow-y-auto whitespace-pre-wrap">
             {isLoading && aiText === "" ? "Analiz ediliyor..." : aiText}
             <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-bounce"></span>
          </div>
          
          <div className="relative">
            <input 
              type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
              placeholder="AI'dan rapor iste veya stok sor..." disabled={isLoading}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs focus:outline-none focus:ring-2 ring-blue-500 transition-all text-white placeholder:text-slate-500" 
            />
            <button onClick={handleAskAi} disabled={isLoading} className="absolute right-3 top-3 p-2 bg-blue-600 rounded-xl hover:scale-105 transition-transform disabled:opacity-50">
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}