import React from 'react';
import { ShoppingBag, Search, User, Heart, MapPin, UserPlus } from 'lucide-react';

export default function Navbar({ onAuthClick }: { onAuthClick: (view: 'login' | 'signup') => void }) {
  return (
    <div className="w-full bg-white sticky top-0 z-40 shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 py-2 px-12 flex justify-between text-[11px] font-medium text-slate-500">
        <div className="flex gap-6">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Hakkımızda</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Kooperatiflerimiz</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Yardım</span>
        </div>
        <div className="flex gap-6 items-center">
          <MapPin size={12}/> <span>Hatay, Türkiye</span>
        </div>
      </div>

      <nav className="px-12 py-5 flex justify-between items-center">
        <div className="flex items-center gap-10">
          <div className="font-black text-2xl italic tracking-tighter text-blue-600 flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white"><ShoppingBag size={20}/></div>
            SMARTOPS <span className="text-slate-800">KOOPERATİF</span>
          </div>
          
          <div className="hidden md:flex relative w-[400px]">
            <input type="text" placeholder="Ürün veya kooperatif ara..." className="w-full bg-slate-100 rounded-full py-2.5 px-6 pl-12 text-sm outline-none focus:ring-2 ring-blue-100 transition-all"/>
            <Search className="absolute left-4 top-2.5 text-slate-400" size={18} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Giriş Yap Butonu */}
          <button 
            onClick={() => onAuthClick('login')} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-600 transition-all group"
          >
            <User size={18} className="group-hover:text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-tight">Giriş Yap</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

          {/* Kayıt Ol Butonu */}
          <button 
            onClick={() => onAuthClick('signup')} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all group"
          >
            <UserPlus size={18} />
            <span className="text-xs font-black uppercase tracking-tight">Kayıt Ol</span>
          </button>
        </div>
      </nav>
    </div>
  );
}