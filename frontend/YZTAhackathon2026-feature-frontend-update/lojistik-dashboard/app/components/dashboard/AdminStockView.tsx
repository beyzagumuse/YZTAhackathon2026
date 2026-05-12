"use client";
import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AdminStockView() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/inventory/')
      .then(r => r.json())
      .then(data => { setInventory(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const criticalCount = inventory.filter(i => i.quantity <= 5).length;
  const lowCount = inventory.filter(i => i.quantity > 5 && i.quantity <= 20).length;

  const filtered = inventory.filter(i => {
    const name = i.products?.name ?? i.product_id ?? '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const stockColor = (qty: number) =>
    qty <= 5 ? 'text-rose-600' : qty <= 20 ? 'text-yellow-600' : 'text-emerald-600';

  const stockBadge = (qty: number) =>
    qty <= 5
      ? <span className="text-xs font-black uppercase text-rose-600 bg-rose-50 px-3 py-1 rounded-full">Kritik</span>
      : qty <= 20
        ? <span className="text-xs font-black uppercase text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">Düşük</span>
        : <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Normal</span>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-3xl font-black italic">Stok Durumu</h2>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-black uppercase text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full">
              <AlertTriangle size={12}/> {criticalCount} Kritik
            </span>
          )}
          {lowCount > 0 && (
            <span className="text-xs font-black uppercase text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">
              {lowCount} Düşük
            </span>
          )}
          <span className="text-xs font-black uppercase text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
            {inventory.length} Ürün
          </span>
        </div>
      </div>

      <input
        type="text"
        placeholder="Ürün ara..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ring-emerald-500"
      />

      {loading ? (
        <div className="p-20 text-center text-slate-400 text-xs font-black uppercase">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ürün</th>
                <th className="text-right px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Fiyat</th>
                <th className="text-right px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Stok</th>
                <th className="text-right px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Durum</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: any, idx: number) => {
                const qty = item.quantity ?? 0;
                return (
                  <tr key={item.product_id ?? item.id ?? idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{item.products?.name ?? item.product_id}</td>
                    <td className="px-6 py-4 text-right text-slate-500 text-xs font-bold">
                      {item.products?.price != null ? `${Number(item.products.price).toFixed(2)} ₺` : '—'}
                    </td>
                    <td className={`px-6 py-4 text-right font-black text-xl ${stockColor(qty)}`}>{qty}</td>
                    <td className="px-6 py-4 text-right">{stockBadge(qty)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
