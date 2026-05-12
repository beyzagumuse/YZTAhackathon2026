"use client";
import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';
import { Users, ShoppingCart, Megaphone, ChevronRight, Loader2 } from 'lucide-react';

type Tab = 'rfm' | 'recommendations' | 'campaigns';

export default function AdminAnalyticsView() {
  const [tab, setTab] = useState<Tab>('rfm');
  const [rfm, setRfm] = useState<any>(null);
  const [recs, setRecs] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:8000/analytics/rfm').then(r => r.json()),
      fetch('http://localhost:8000/analytics/recommendations').then(r => r.json()),
      fetch('http://localhost:8000/analytics/campaigns').then(r => r.json()),
    ])
      .then(([rfmData, recData, campData]) => {
        setRfm(rfmData);
        setRecs(recData);
        setCampaigns(campData);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-24 gap-3 text-slate-400">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-xs font-black uppercase tracking-widest">Analiz hesaplanıyor...</span>
    </div>
  );

  if (error) return (
    <div className="p-16 text-center text-rose-500 font-bold text-sm">{error}</div>
  );

  const tabs: [Tab, typeof Users, string][] = [
    ['rfm', Users, 'RFM Analizi'],
    ['recommendations', ShoppingCart, 'Ürün Önerileri'],
    ['campaigns', Megaphone, 'Kampanyalar'],
  ];

  return (
    <div className="space-y-6">

      {/* ── Tab Bar ── */}
      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl w-fit">
        {tabs.map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all
              ${tab === key ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          RFM TAB
      ════════════════════════════════════════════ */}
      {tab === 'rfm' && rfm && (
        <div className="space-y-6">
          {rfm.customers.length === 0 ? (
            <div className="p-16 text-center bg-slate-50 rounded-[32px]">
              <p className="text-slate-400 font-bold text-xs uppercase">Henüz analiz edilecek kayıtlı müşteri verisi yok.</p>
            </div>
          ) : (
            <>
              {/* Summary row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Donut */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-4">Segment Dağılımı</h3>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={rfm.segments} cx="50%" cy="50%" innerRadius={48} outerRadius={75}
                          paddingAngle={3} dataKey="count">
                          {rfm.segments.map((s: any, i: number) => <Cell key={i} fill={s.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {rfm.segments.map((s: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                          <span className="font-bold text-slate-600">{s.label}</span>
                        </div>
                        <span className="font-black text-slate-800">{s.count} kişi</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bar chart */}
                <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-4">Segmentlere Göre Müşteri Sayısı</h3>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rfm.segments}>
                        <XAxis dataKey="label" axisLine={false} tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,.1)' }} />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={36}>
                          {rfm.segments.map((s: any, i: number) => <Cell key={i} fill={s.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Customer table */}
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Müşteri RFM Skorları — {rfm.customers.length} kişi
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-50">
                        {['Müşteri', 'Son Sipariş', 'Sipariş Sayısı', 'Harcama', 'R', 'F', 'M', 'Segment'].map(h => (
                          <th key={h} className="text-left px-6 py-3 font-black text-[10px] text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rfm.customers.map((c: any, i: number) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{c.name}</td>
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{c.recency_days}g önce</td>
                          <td className="px-6 py-4 font-bold text-center">{c.frequency}</td>
                          <td className="px-6 py-4 font-bold text-emerald-600 whitespace-nowrap">
                            {c.monetary.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                          </td>
                          {[c.r_score, c.f_score, c.m_score].map((score: number, si: number) => (
                            <td key={si} className="px-6 py-4">
                              <span className={`w-6 h-6 inline-flex items-center justify-center rounded-lg font-black text-white text-[10px]
                                ${score >= 3 ? 'bg-emerald-500' : score === 2 ? 'bg-amber-400' : 'bg-rose-400'}`}>
                                {score}
                              </span>
                            </td>
                          ))}
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black text-white whitespace-nowrap"
                              style={{ background: c.segment_color }}>
                              {c.segment_label}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════
          RECOMMENDATIONS TAB
      ════════════════════════════════════════════ */}
      {tab === 'recommendations' && recs && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-2xl px-4 py-2 border border-slate-100 shadow-sm text-xs font-black text-slate-600">
              {recs.basket_count} sipariş analiz edildi
            </div>
            <div className={`rounded-2xl px-4 py-2 text-xs font-black text-white
              ${recs.method === 'apriori' ? 'bg-purple-600' : 'bg-blue-600'}`}>
              {recs.method === 'apriori' ? 'Apriori Algoritması' : 'Co-occurrence Analizi'}
            </div>
          </div>

          {recs.rules.length === 0 ? (
            <div className="bg-slate-50 rounded-[32px] p-16 text-center">
              <p className="text-slate-400 font-bold text-xs uppercase">
                Anlamlı birliktelik kuralı bulunamadı. Daha fazla çok ürünlü sipariş gerekli.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Birliktelik Kuralları — "X alanlar Y'yi de alıyor"
                </h3>
              </div>
              <div className="divide-y divide-slate-50">
                {recs.rules.map((rule: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 px-8 py-4 hover:bg-slate-50 transition-colors">
                    <span className="text-[10px] font-black text-slate-300 w-5 text-center">{i + 1}</span>
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      <span className="font-black text-slate-800 text-xs bg-slate-100 px-3 py-1.5 rounded-xl truncate max-w-[200px]">
                        {rule.if_product}
                      </span>
                      <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                      <span className="font-black text-blue-700 text-xs bg-blue-50 px-3 py-1.5 rounded-xl truncate max-w-[200px]">
                        {rule.then_product}
                      </span>
                    </div>
                    <div className="flex items-center gap-5 flex-shrink-0">
                      <div className="text-center">
                        <div className="text-xs font-black text-emerald-600">{(rule.confidence * 100).toFixed(0)}%</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">güven</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-black text-purple-600">{rule.lift.toFixed(2)}×</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">lift</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-black text-slate-500">{(rule.support * 100).toFixed(1)}%</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">destek</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════
          CAMPAIGNS TAB
      ════════════════════════════════════════════ */}
      {tab === 'campaigns' && campaigns && (
        <div className="space-y-4">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            {campaigns.total_customers} müşteri · {campaigns.campaigns.length} segment ·
            öneri motoru: {campaigns.recommendation_method === 'apriori' ? 'Apriori' : 'Co-occurrence'}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.campaigns.map((camp: any, i: number) => (
              <div key={i} className="rounded-[32px] overflow-hidden border border-slate-100 shadow-sm"
                style={{ borderTopColor: camp.color, borderTopWidth: 4 }}>
                <div className="bg-white p-7 space-y-4">

                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-slate-800 text-sm">{camp.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{camp.description}</p>
                    </div>
                    <span className="text-xs font-black px-3 py-1.5 rounded-full text-white flex-shrink-0"
                      style={{ background: camp.color }}>
                      {camp.customer_count} kişi
                    </span>
                  </div>

                  {/* Offer + message */}
                  <div className="rounded-2xl p-4 space-y-1.5" style={{ background: camp.color + '12' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Teklif</span>
                      <span className="text-xs font-black" style={{ color: camp.color }}>{camp.offer}</span>
                    </div>
                    <p className="text-xs text-slate-600 italic">"{camp.message}"</p>
                  </div>

                  {/* Recommended products */}
                  {camp.recommended_products.length > 0 && (
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Apriori Ürün Önerisi
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {camp.recommended_products.map((p: string, pi: number) => (
                          <span key={pi} className="text-[10px] font-black px-2.5 py-1 rounded-xl text-white truncate max-w-[150px]"
                            style={{ background: camp.color }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sample customers */}
                  {camp.sample_customers.length > 0 && (
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Hedef Müşteriler (örnek)
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {camp.sample_customers.map((c: any, ci: number) => (
                          <div key={ci} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-700">{c.name}</span>
                            <span className="text-[9px] text-emerald-600 font-black">
                              {c.monetary.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
