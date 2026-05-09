import React from 'react';
import { ShoppingBag, Star, ArrowRight } from 'lucide-react';

const categories = [
  { id: 1, name: "Zeytinyağı", count: "12 Ürün", color: "bg-emerald-50 text-emerald-600" },
  { id: 2, name: "Baharatlar", count: "45 Ürün", color: "bg-orange-50 text-orange-600" },
  { id: 3, name: "Salçalar", count: "8 Ürün", color: "bg-rose-50 text-rose-600" },
  { id: 4, name: "Kuruyemiş", count: "22 Ürün", color: "bg-amber-50 text-amber-600" },
  { id: 5, name: "Tatlılar", count: "15 Ürün", color: "bg-purple-50 text-purple-600" },
  { id: 6, name: "El Sanatları", count: "30 Ürün", color: "bg-blue-50 text-blue-600" },
];

export default function CategoryGrid() {
  return (
    <section className="mt-24 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Başlık Alanı */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
            <Star size={14} fill="currentColor" />
            <span>Kooperatiften Sofranıza</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900">
            Öne Çıkan Kategoriler
          </h2>
        </div>
        <button className="group flex items-center gap-2 text-sm font-black uppercase text-blue-600 border-b-2 border-blue-600 pb-1 hover:gap-3 transition-all">
          Tümünü İncele <ArrowRight size={16} />
        </button>
      </div>

      {/* Grid Yapısı */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="group cursor-pointer p-8 bg-white rounded-[40px] border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 text-center space-y-4"
          >
            {/* İkon Alanı */}
            <div className={`w-20 h-20 ${cat.color} rounded-[28px] mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
              <ShoppingBag size={32} />
            </div>
            
            {/* Metin Alanı */}
            <div className="space-y-1">
              <p className="font-black text-slate-800 text-lg tracking-tight group-hover:text-blue-600 transition-colors">
                {cat.name}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {cat.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Alt Bilgi Bandı (İsteğe Bağlı) */}
      <div className="mt-12 bg-slate-50 rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-slate-100">
        <div className="flex items-center gap-4 text-slate-600">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 font-black">
            %100
          </div>
          <p className="text-sm font-bold uppercase tracking-tight leading-tight">
            Tüm gelirler doğrudan <br /> Hataylı üreticilere aktarılır.
          </p>
        </div>
        <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
          Destek Olmaya Başla
        </button>
      </div>
    </section>
  );
}