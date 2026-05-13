"use client";
import { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { Package, TrendingUp, Truck, AlertCircle, Send, Bot, Loader2 } from 'lucide-react';

type Model = 'gemini' | 'gemma';
interface Message { role: 'user' | 'bot'; text: string; }

const cleanMarkdown = (t: string) =>
  t.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1').replace(/#{1,6}\s/g, '').trim();

const BLUE_SHADES = ['#1d4ed8','#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#dbeafe','#eff6ff'];
const GREEN_SHADES = ['#065f46','#047857','#059669','#10b981','#34d399','#6ee7b7','#a7f3d0','#d1fae5'];
const STATUS_CFG = [
  { key: 'pending',   label: 'Hazırlanıyor', color: '#f59e0b' },
  { key: 'shipped',   label: 'Kargoda',      color: '#3b82f6' },
  { key: 'delivered', label: 'Teslim Edildi',color: '#10b981' },
];

const SEVERITY_CFG: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  high:   { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   badge: 'bg-rose-100 text-rose-600' },
  medium: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-600' },
  low:    { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-600' },
};

const TYPE_ICON: Record<string, string> = {
  safety_stock:    '⚠',
  critical_stock:  '🔴',
  pending_overload:'⏳',
  slow_moving:     '📦',
};

export default function AdminView() {
  const [stats, setStats] = useState<any>(null);
  const [anomalyReport, setAnomalyReport] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Merhaba, ADMIN yetkisiyle bağlandınız. Sistem analizleri ve raporlamalar için hazırım.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<Model>('gemini');
  const sessionIdRef = useRef('admin-' + Math.random().toString(36).slice(2));
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost:8000/orders/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
    fetch('http://localhost:8000/inventory/anomaly-report')
      .then(r => r.json())
      .then(data => setAnomalyReport(data))
      .catch(() => {});
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const handleAsk = async () => {
    const text = chatInput.trim();
    if (!text || isLoading) return;
    setChatInput('');
    setMessages(p => [...p, { role: 'user', text }]);
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, model, session_id: sessionIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Sunucu hatası');
      setMessages(p => [...p, { role: 'bot', text: cleanMarkdown(data.reply || 'Yanıt alınamadı.') }]);
    } catch (e: any) {
      setMessages(p => [...p, { role: 'bot', text: e.message || 'Bağlantı hatası.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const statusData = stats
    ? STATUS_CFG.map(s => ({ name: s.label, value: stats[s.key], color: s.color }))
    : [];

  const kpis = [
    { label: 'Toplam Sipariş', val: stats?.total_orders ?? '—', sub: 'sipariş', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Package size={18}/> },
    { label: 'Toplam Ciro', val: stats ? `${Number(stats.total_revenue).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺` : '—', sub: 'gelir', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <TrendingUp size={18}/> },
    { label: 'Kargoda', val: stats?.shipped ?? '—', sub: 'sipariş', color: 'text-amber-600', bg: 'bg-amber-50', icon: <Truck size={18}/> },
    { label: 'Kritik Anomali', val: anomalyReport?.total ?? '—', sub: 'uyarı', color: 'text-rose-600', bg: 'bg-rose-50', icon: <AlertCircle size={18}/> },
  ];

  return (
    <div className="space-y-8">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 ${k.bg} ${k.color} rounded-2xl flex items-center justify-center mb-4`}>
              {k.icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
            <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Anomaly Warning Panel ── */}
      {anomalyReport?.anomalies?.length > 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                Anomali Raporu — {anomalyReport.total} Uyarı
              </span>
            </div>
            <div className="flex gap-2 text-[10px] font-black uppercase">
              {anomalyReport.by_type?.safety_stock > 0 && (
                <span className="bg-rose-100 text-rose-600 px-2 py-1 rounded-lg">
                  Emniyet Stoğu: {anomalyReport.by_type.safety_stock}
                </span>
              )}
              {anomalyReport.by_type?.critical_stock > 0 && (
                <span className="bg-rose-100 text-rose-600 px-2 py-1 rounded-lg">
                  Kritik: {anomalyReport.by_type.critical_stock}
                </span>
              )}
              {anomalyReport.by_type?.pending_overload > 0 && (
                <span className="bg-amber-100 text-amber-600 px-2 py-1 rounded-lg">
                  Sipariş Yığılması: {anomalyReport.by_type.pending_overload}
                </span>
              )}
              {anomalyReport.by_type?.slow_moving > 0 && (
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg">
                  Hareketsiz: {anomalyReport.by_type.slow_moving}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {anomalyReport.anomalies.map((item: any, i: number) => {
              const cfg = SEVERITY_CFG[item.severity] ?? SEVERITY_CFG.low;
              const icon = TYPE_ICON[item.type] ?? '⚠';
              return (
                <div key={i} className={`bg-white rounded-2xl px-4 py-3 border ${cfg.border} space-y-1.5`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${cfg.badge}`}>
                      {icon} {item.label}
                    </span>
                  </div>
                  {item.product && (
                    <p className="text-xs font-black text-slate-800 truncate">{item.product}</p>
                  )}
                  <p className={`text-[10px] font-bold ${cfg.text}`}>{item.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Top Products (horizontal bar) + AI Chat ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-blue-600 rounded-full" /> En Çok Satan Ürünler
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.top_products ?? []} layout="vertical" margin={{ left: 0, right: 32 }}>
                <XAxis type="number" axisLine={false} tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={130}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,.1)' }} />
                <Bar dataKey="quantity" radius={[0, 10, 10, 0]} barSize={20}
                  label={{ position: 'right', fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}>
                  {(stats?.top_products ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={BLUE_SHADES[i % BLUE_SHADES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Chat */}
        <div className="bg-slate-950 rounded-[48px] p-6 text-white flex flex-col shadow-2xl border-b-[16px] border-blue-600"
          style={{ maxHeight: 520 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_#3b82f6]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                {model === 'gemini' ? 'Gemini 2.5 Flash' : 'Gemma4:31B (Local)'}
              </span>
            </div>
            {isLoading && <Loader2 size={14} className="text-blue-500 animate-spin" />}
          </div>
          <div className="flex gap-2 mb-3">
            {(['gemini', 'gemma'] as Model[]).map(m => (
              <button key={m} onClick={() => setModel(m)}
                className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all
                  ${model === m
                    ? m === 'gemini' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                    : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}>
                {m === 'gemini' ? 'Gemini' : 'Gemma4'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                    <Bot size={12} className="text-blue-400" />
                  </div>
                )}
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed
                  ${msg.role === 'bot' ? 'bg-white/10 text-blue-100 rounded-bl-sm' : 'bg-blue-600 text-white rounded-br-sm'}`}>
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
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2">
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="Rapor iste veya stok sor..." disabled={isLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 ring-blue-500 text-white placeholder:text-slate-500 disabled:opacity-50"
            />
            <button onClick={handleAsk} disabled={isLoading || !chatInput.trim()}
              className="w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center transition-all disabled:opacity-40">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Order Status Donut + Category Sales ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-amber-500 rounded-full" /> Sipariş Durumları
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                  paddingAngle={4} dataKey="value">
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="font-black text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-emerald-500 rounded-full" /> Kategori Bazlı Satış Hacmi
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.category_sales ?? []} margin={{ bottom: 8 }}>
                <XAxis dataKey="category" axisLine={false} tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#f0fdf4' }}
                  contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,.1)' }} />
                <Bar dataKey="quantity" radius={[10, 10, 0, 0]} barSize={44}>
                  {(stats?.category_sales ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={GREEN_SHADES[i % GREEN_SHADES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
