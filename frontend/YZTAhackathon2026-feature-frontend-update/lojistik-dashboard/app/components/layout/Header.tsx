import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Header({ role }: { role: string }) {
  return (
    <header className="flex justify-between items-center mb-12">
      <div>
        <h1 className="text-4xl font-black text-slate-950 tracking-tighter uppercase italic">
          {role === 'admin' ? "Sistem Yönetimi" : role === 'anonimuser' ? "Misafir Takibi" : "Hoş Geldiniz"}
        </h1>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          {role.toUpperCase()} Yetkisi Aktif
        </p>
      </div>
      <div className="bg-slate-100 py-3 px-6 rounded-3xl flex items-center gap-3">
         <ShieldCheck size={18} className="text-blue-600" />
         <span className="text-xs font-black uppercase tracking-widest text-slate-600">Güvenli Bağlantı</span>
      </div>
    </header>
  );
}