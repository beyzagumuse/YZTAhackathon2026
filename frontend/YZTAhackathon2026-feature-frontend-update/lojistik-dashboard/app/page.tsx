"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Truck, Box, MapPin, AlertCircle, ShieldCheck, MessageSquare, LayoutDashboard, Search, Loader2 } from 'lucide-react';

const mockData = [
  { name: 'Marmara', sevkiyat: 8200, anomali: false },
  { name: 'Ege', sevkiyat: 5100, anomali: false },
  { name: 'İç An.', sevkiyat: 6400, anomali: false },
  { name: 'Akdeniz', sevkiyat: 4800, anomali: false },
  { name: 'Karadeniz', sevkiyat: 3900, anomali: true }, 
];

export default function SmartOpsDashboard() {
  const [isReady, setIsReady] = useState(false);
  const [role, setRole] = useState<'admin' | 'customer' | 'seller'>('admin');
  
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
    setIsReady(true);
    streamText(`Merhaba, ${role.toUpperCase()} yetkisiyle bağlandınız. Sistem analizleri ve raporlamalar için hazırım.`);
  }, [role]);

  const handleAskAi = async () => {
    if (!chatInput.trim()) return;
    
    setIsLoading(true);
    setAiText(""); 
    
    try {
      const response = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput })
      });
      
      const data = await response.json();
      
      streamText(data.reply || "Yanıt alınamadı.");
      
    } catch (error) {
      streamText("Bağlantı hatası: Backend sunucusuna ulaşılamıyor. Lütfen FastAPI sunucusunun çalıştığından emin olun.");
    } finally {
      setIsLoading(false);
      setChatInput(""); 
    }
  };

  if (!isReady) return null;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Yan Menü */}
      <aside className="w-72 bg-slate-950 text-white p-8 flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Truck size={20} />
          </div>
          <span className="font-black text-xl tracking-tighter italic">SMARTOPS AI</span>
        </div>
        
        <nav className="flex-1 space-y-3">
          <button className={`flex items-center gap-3 w-full p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${role === 'admin' ? 'bg-blue-600 shadow-lg shadow-blue-900/40' : 'hover:bg-slate-900 text-slate-500'}`}>
            <LayoutDashboard size={18} /> {role === 'admin' ? 'Yönetim Paneli' : 'Panel'}
          </button>
          <button className="flex items-center gap-3 w-full p-4 hover:bg-slate-900 text-slate-500 rounded-2xl text-xs font-bold uppercase transition-all">
            <MessageSquare size={18} /> AI Asistan
          </button>
        </nav>

        <div className="mt-auto p-5 bg-slate-900 rounded-[32px] border border-slate-800">
          <p className="text-[9px] text-slate-500 mb-3 font-black uppercase tracking-[0.2em]">Aktif Kullanıcı Rolü</p>
          <div className="flex flex-col gap-2">
            {['admin', 'customer', 'seller'].map((r) => (
              <button 
                key={r}
                onClick={() => setRole(r as any)}
                className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase transition-all border ${role === r ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-950 tracking-tighter uppercase italic">
              {role === 'admin' ? "Ulusal Operasyon Merkezi" : "Kargo & Sevkiyat Takibi"}
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Canlı Veri Akışı Aktif
            </p>
          </div>
          <div className="bg-white py-3 px-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
             <ShieldCheck size={18} className="text-blue-600" />
             <span className="text-xs font-black uppercase tracking-widest text-slate-600">{role} Yetkisi</span>
          </div>
        </header>

        {role === 'admin' ? (
          /* ADMIN DASHBOARD */
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Aktif Araç', val: '3,120', color: 'text-blue-600', icon: <Truck size={16}/> },
                { label: 'İşlemdeki Paket', val: '185k', color: 'text-slate-800', icon: <Box size={16}/> },
                { label: 'Varış Merkezi', val: '412', color: 'text-emerald-600', icon: <MapPin size={16}/> },
                { label: 'Kritik Anomali', val: '03', color: 'text-rose-600', icon: <AlertCircle size={16}/> }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <div className={`${stat.color} opacity-20`}>{stat.icon}</div>
                  </div>
                  <p className={`text-4xl font-black ${stat.color}`}>{stat.val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Grafik Alanı */}
              <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-10 flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                  Bölgesel Sevkiyat Hacmi & Anomali Analizi
                </h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="sevkiyat" radius={[15, 15, 0, 0]} barSize={60}>
                        {mockData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.anomali ? '#f43f5e' : '#2563eb'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gemini AI Chat Modülü */}
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
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                    placeholder="AI'dan rapor iste veya stok sor..." 
                    disabled={isLoading}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs focus:outline-none focus:ring-2 ring-blue-500 transition-all text-white placeholder:text-slate-500" 
                  />
                  <button 
                    onClick={handleAskAi}
                    disabled={isLoading}
                    className="absolute right-3 top-3 p-2 bg-blue-600 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CUSTOMER DASHBOARD */
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-12 rounded-[48px] border-2 border-dashed border-slate-200 text-center space-y-6">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter">Kargonuz Nerede?</h2>
              <p className="text-slate-400 font-medium max-w-md mx-auto">Sipariş numaranızı girerek gerçek zamanlı yapay zeka destekli takibi başlatın.</p>
              <div className="flex gap-4 max-w-lg mx-auto pt-6">
                <input type="text" placeholder="Örn: TR-123456" className="flex-1 bg-slate-100 border-none rounded-3xl p-6 text-lg font-bold outline-none focus:ring-4 ring-blue-100 transition-all text-slate-900" />
                <button className="bg-slate-950 text-white px-10 rounded-3xl font-black uppercase text-sm hover:bg-blue-600 transition-colors">Sorgula</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-emerald-600 p-10 rounded-[48px] text-white shadow-xl flex flex-col justify-between min-h-[250px]">
                  <ShieldCheck size={40} />
                  <div>
                    <h4 className="text-2xl font-bold">Güvenli Teslimat</h4>
                    <p className="opacity-80 text-sm mt-2 font-medium">Paketiniz Gemini AI denetimindeki rotalarda güvende.</p>
                  </div>
               </div>
               <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[250px]">
                  <Box size={40} className="text-blue-600" />
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900">Aktif Siparişler</h4>
                    <p className="text-slate-400 text-sm mt-2 font-medium">Şu an bekleyen kargonuz bulunmamaktadır.</p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}