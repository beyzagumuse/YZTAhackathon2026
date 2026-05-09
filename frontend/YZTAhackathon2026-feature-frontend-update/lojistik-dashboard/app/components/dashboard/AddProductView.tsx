import React from 'react';
import { PackagePlus, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export default function AddProductView() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
          <PackagePlus size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tighter italic uppercase text-slate-900">Yeni Ürün Ekle</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Kooperatif Envanteri</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ürün Adı</label>
            <input type="text" placeholder="Örn: Ev Yapımı Salça" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 ring-emerald-100 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kooperatif Seçin</label>
            <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 ring-emerald-100 outline-none text-slate-600">
              <option>Hatay Kadın Kooperatifi</option>
              <option>Soma Kadın Atölyesi</option>
              <option>Gümüş Kadın Kooperatifi</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fiyat (TL)</label>
            <input type="number" placeholder="0.00" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 ring-emerald-100 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stok Miktarı</label>
            <input type="number" placeholder="Adet" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 ring-emerald-100 outline-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ürün Görsel URL</label>
          <div className="relative">
            <ImageIcon className="absolute left-4 top-4 text-slate-300" size={18} />
            <input type="text" placeholder="https://..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-sm focus:ring-2 ring-emerald-100 outline-none" />
          </div>
        </div>

        <div className="pt-6">
          <button onClick={() => alert("Ürün başarıyla veritabanına eklendi! (Simülasyon)")} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase text-xs tracking-widest hover:bg-emerald-600 transition-colors shadow-xl flex items-center justify-center gap-2">
            <CheckCircle2 size={18} /> Sistemi Güncelle
          </button>
        </div>
      </div>
    </div>
  );
}