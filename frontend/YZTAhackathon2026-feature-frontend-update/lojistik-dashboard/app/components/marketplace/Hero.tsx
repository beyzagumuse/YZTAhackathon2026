import React from 'react';

export default function Hero({ onStartClick }: { onStartClick: () => void }) {
  return (
    <div className="bg-slate-900 rounded-[48px] h-[450px] relative overflow-hidden flex items-center px-20">
      <div className="relative z-10 space-y-6 max-w-xl text-white">
        <span className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Yeniden Hatay</span>
        <h1 className="text-6xl font-black tracking-tighter leading-[0.9]">Toprağın <br/> Bereketini <br/> Keşfedin.</h1>
        <p className="text-slate-400 text-lg">Hatay'ın doğal kooperatif ürünleri artık tek tıkla kapınızda.</p>
        <button onClick={onStartClick} className="bg-white text-slate-950 px-10 py-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 hover:text-white transition-all shadow-xl">Hemen İncele</button>
      </div>
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent"></div>
    </div>
  );
}