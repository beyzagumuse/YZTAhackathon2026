import React, { useState } from 'react';
import { ShoppingBag, Search, User, Heart, MapPin, UserPlus, Box, MessageSquare, Ticket, Coins, Settings, LogOut, ChevronDown } from 'lucide-react';

interface NavbarProps {
  isLoggedIn: boolean;
  userName?: string;
  onAuthClick: (view: 'login' | 'signup') => void;
  onLogout: () => void;
  onNavigateToPanel: () => void; // Paneli açmak için
}

export default function Navbar({ isLoggedIn, userName, onAuthClick, onLogout, onNavigateToPanel }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="w-full bg-white sticky top-0 z-40 shadow-sm font-sans">
      {/* Top Bar */}
      <div className="bg-slate-50 border-b border-slate-200 py-2 px-12 flex justify-between text-[11px] font-medium text-slate-500">
        <div className="flex gap-6">
          <span className="hover:text-blue-600 cursor-pointer">Hakkımızda</span>
          <span className="hover:text-blue-600 cursor-pointer">Kooperatiflerimiz</span>
        </div>
        <div className="flex gap-6 items-center">
          <MapPin size={12}/> <span>Hatay, Türkiye</span>
        </div>
      </div>

      <nav className="px-12 py-5 flex justify-between items-center relative">
        <div className="flex items-center gap-10">
          <div className="font-black text-2xl italic tracking-tighter text-blue-600 flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white"><ShoppingBag size={20}/></div>
            SMARTOPS <span className="text-slate-800">KOOPERATİF</span>
          </div>
          
          <div className="hidden md:flex relative w-[400px]">
            <input type="text" placeholder="Ürün veya kooperatif ara..." className="w-full bg-slate-100 rounded-full py-2.5 px-6 pl-12 text-sm outline-none focus:ring-2 ring-blue-100 transition-all"/>
            <Search className="absolute left-4 top-2.5 text-slate-400" size={18} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <button onClick={() => onAuthClick('login')} className="flex items-center gap-2 px-4 py-2 text-slate-600 text-xs font-bold uppercase tracking-tight hover:text-blue-600">Giriş Yap</button>
              <button onClick={() => onAuthClick('signup')} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-blue-200">Kayıt Ol</button>
            </>
          ) : (
            <div className="relative">
              {/* Kullanıcı Dropdown Tetikleyici */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
              >
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xs">
                  {userName?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold leading-none uppercase">Hesabım</p>
                  <p className="text-xs font-black text-slate-800 tracking-tight">{userName}</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Resimdeki Menü Tasarımı */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-[24px] shadow-2xl border border-slate-100 py-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-2 space-y-1">
                    <button onClick={onNavigateToPanel} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl text-slate-700 transition-colors">
                      <Box size={18} className="text-slate-400" />
                      <span className="text-sm font-bold">Tüm Siparişlerim</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl text-slate-700 transition-colors">
                      <MessageSquare size={18} className="text-slate-400" />
                      <span className="text-sm font-bold">Satıcı Mesajlarım</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl text-slate-700 transition-colors">
                      <Ticket size={18} className="text-slate-400" />
                      <span className="text-sm font-bold">İndirim Kuponlarım</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl text-slate-700 transition-colors">
                      <Coins size={18} className="text-slate-400" />
                      <span className="text-sm font-bold">Krediler</span>
                    </button>
                    <div className="h-[1px] bg-slate-100 my-2 mx-4"></div>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl text-slate-700 transition-colors">
                      <User size={18} className="text-slate-400" />
                      <span className="text-sm font-bold">Kullanıcı Bilgilerim</span>
                    </button>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 rounded-xl text-rose-600 transition-colors">
                      <LogOut size={18} />
                      <span className="text-sm font-bold">Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <Heart size={22} className="text-slate-400 cursor-pointer hover:text-rose-500 transition-colors" />
        </div>
      </nav>
    </div>
  );
}