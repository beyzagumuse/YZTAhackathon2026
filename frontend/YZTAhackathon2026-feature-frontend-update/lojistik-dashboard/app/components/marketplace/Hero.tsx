import React from 'react';
import { Leaf } from 'lucide-react';

export default function Hero({ onStartClick }: { onStartClick: () => void }) {
  return (
    <div className="bg-emerald-950 rounded-[48px] h-[400px] relative overflow-hidden flex items-center px-12 md:px-20">
      <div className="relative z-10 space-y-6 max-w-2xl text-white">
        <div className="flex items-center gap-2">
          <Leaf size={16} className="text-emerald-400" />
          <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Kadınların Emeği, Doğanın Bereketi</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.1]">
          Anadolu'nun <br/> Doğal Lezzetleri <br/> Kapınızda.
        </h1>
        
        <p className="text-emerald-100/80 text-base md:text-lg max-w-lg">
          Tohumdan sofraya; hiçbir katkı maddesi içermeyen, kooperatiflerimizin sevgiyle ürettiği yöresel ürünleri keşfedin.
        </p>
        
        <div className="pt-2">
          <button onClick={onStartClick} className="bg-white text-emerald-950 px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-emerald-400 hover:text-emerald-950 transition-all shadow-xl">
            Ürünleri İncele
          </button>
        </div>
      </div>
      
      {/* Dekoratif Arka Plan */}
      <div className="absolute right-0 top-0 w-2/3 h-full bg-gradient-to-l from-emerald-600/30 to-transparent"></div>
    </div>
  );
}