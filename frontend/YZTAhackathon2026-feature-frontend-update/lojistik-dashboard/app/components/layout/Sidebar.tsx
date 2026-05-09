import React from 'react';
import { LayoutDashboard, Users, Settings, ShoppingBag, LogOut, PackagePlus } from 'lucide-react';

export default function Sidebar({ role, activeTab, setActiveTab, onLogout }: any) {
  return (
    <aside className="w-72 bg-white border-r border-slate-100 p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
          <ShoppingBag size={20} />
        </div>
        <span className="font-black text-xl tracking-tighter text-slate-900 italic">SMARTOPS</span>
      </div>
      
      <nav className="flex-1 space-y-2">
        <button 
          onClick={() => setActiveTab('panel')}
          className={`flex items-center gap-3 w-full p-4 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === 'panel' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <LayoutDashboard size={18} /> Panel
        </button>
        
        {role === 'admin' && (
          <>
            <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 w-full p-4 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === 'users' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}><Users size={18} /> Kullanıcılar</button>
            <button onClick={() => setActiveTab('add-product')} className={`flex items-center gap-3 w-full p-4 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === 'add-product' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}><PackagePlus size={18} /> Ürün Ekle</button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 w-full p-4 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}><Settings size={18} /> Ayarlar</button>
          </>
        )}

        {role === 'kayıtlıuser' && (
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 w-full p-4 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === 'orders' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <ShoppingBag size={18} /> Siparişlerim
          </button>
        )}
      </nav>

      <button onClick={onLogout} className="mt-auto p-4 text-rose-500 text-[10px] font-black uppercase flex items-center gap-2 hover:bg-rose-50 rounded-xl transition-colors">
        <LogOut size={16} /> Çıkış Yap
      </button>
    </aside>
  );
}