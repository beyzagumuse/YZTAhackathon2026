import React from 'react';
import { Truck, LayoutDashboard, Users, Settings, ShoppingBag } from 'lucide-react';

type Role = 'admin' | 'anonimuser' | 'kayıtlıuser';

export default function Sidebar({ role, onLogout }: { role: Role, onLogout: () => void }) {
  return (
    <aside className="w-72 bg-slate-950 text-white p-8 flex flex-col shadow-2xl">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
          <Truck size={20} />
        </div>
        <span className="font-black text-xl tracking-tighter italic">SMARTOPS</span>
      </div>
      
      <nav className="flex-1 space-y-2">
        <button className="flex items-center gap-3 w-full p-4 bg-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/20">
          <LayoutDashboard size={18} /> Panel
        </button>
        
        {role === 'admin' && (
          <>
            <button className="flex items-center gap-3 w-full p-4 hover:bg-slate-900 text-slate-400 rounded-2xl text-xs font-bold uppercase transition-all">
              <Users size={18} /> Kullanıcı Yönetimi
            </button>
            <button className="flex items-center gap-3 w-full p-4 hover:bg-slate-900 text-slate-400 rounded-2xl text-xs font-bold uppercase transition-all">
              <Settings size={18} /> Sistem Ayarları
            </button>
          </>
        )}

        {role === 'kayıtlıuser' && (
          <button className="flex items-center gap-3 w-full p-4 hover:bg-slate-900 text-slate-400 rounded-2xl text-xs font-bold uppercase transition-all">
            <ShoppingBag size={18} /> Siparişlerim
          </button>
        )}
      </nav>

      <button 
        onClick={onLogout}
        className="mt-auto p-4 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 rounded-xl transition-all"
      >
        Oturumu Kapat
      </button>
    </aside>
  );
}