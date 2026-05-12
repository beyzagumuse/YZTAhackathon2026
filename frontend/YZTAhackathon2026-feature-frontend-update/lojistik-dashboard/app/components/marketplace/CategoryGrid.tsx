import React, { useEffect, useState } from 'react';
import { ShoppingBag, Star, ArrowRight } from 'lucide-react';

const PALETTE = [
  'bg-emerald-50 text-emerald-600',
  'bg-orange-50 text-orange-600',
  'bg-rose-50 text-rose-600',
  'bg-amber-50 text-amber-600',
  'bg-purple-50 text-purple-600',
  'bg-blue-50 text-blue-600',
  'bg-teal-50 text-teal-600',
  'bg-pink-50 text-pink-600',
];

interface CategoryGridProps {
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

export default function CategoryGrid({ onCategorySelect, selectedCategory }: CategoryGridProps) {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/products/categories')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <section className="mt-24 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
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
        {selectedCategory && (
          <button
            onClick={() => onCategorySelect?.('')}
            className="group flex items-center gap-2 text-sm font-black uppercase text-rose-500 border-b-2 border-rose-400 pb-1 hover:gap-3 transition-all"
          >
            Filtreyi Temizle ×
          </button>
        )}
        {!selectedCategory && (
          <button className="group flex items-center gap-2 text-sm font-black uppercase text-blue-600 border-b-2 border-blue-600 pb-1 hover:gap-3 transition-all">
            Tümünü İncele <ArrowRight size={16} />
          </button>
        )}
      </div>

      {categories.length === 0 ? null : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, i) => {
            const color = PALETTE[i % PALETTE.length];
            const isActive = selectedCategory === cat.name;
            return (
              <div
                key={cat.name}
                onClick={() => onCategorySelect?.(isActive ? '' : cat.name)}
                className={`group cursor-pointer p-8 rounded-[40px] border transition-all duration-300 text-center space-y-4
                  ${isActive
                    ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/20'
                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5'
                  }`}
              >
                <div className={`w-20 h-20 rounded-[28px] mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-500
                  ${isActive ? 'bg-white/20 text-white' : color}`}>
                  <ShoppingBag size={32} />
                </div>
                <div className="space-y-1">
                  <p className={`font-black text-lg tracking-tight transition-colors
                    ${isActive ? 'text-white' : 'text-slate-800 group-hover:text-blue-600'}`}>
                    {cat.name}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest
                    ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {cat.count} Ürün
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
