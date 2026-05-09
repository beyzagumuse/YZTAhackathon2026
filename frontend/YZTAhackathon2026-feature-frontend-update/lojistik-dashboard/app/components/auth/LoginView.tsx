import React from 'react';
import { Truck, Search, LogIn } from 'lucide-react';

type Role = 'admin' | 'anonimuser' | 'kayıtlıuser';

export default function LoginView({ role, setRole, onLogin }: { role: Role, setRole: (r: Role) => void, onLogin: () => void }) {
  return (
    <div className="flex h-screen bg-slate-950 items-center justify-center p-6 relative">
      <div className="absolute top-8 right-8 bg-slate-900 p-2 rounded-2xl border border-slate-800 flex gap-1 shadow-2xl">
        {(['admin', 'anonimuser', 'kayıtlıuser'] as Role[]).map((r) => (
          <button 
            key={r} onClick={() => setRole(r)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${role === r ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {r === 'kayıtlıuser' ? 'Kayıtlı' : r === 'anonimuser' ? 'Anonim' : 'Admin'}
          </button>
        ))}
      </div>

      <div className="max-w-md w-full space-y-8 bg-slate-900 p-10 rounded-[48px] border border-slate-800 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-900/20">
            <Truck className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">SmartOps AI</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            {role === 'anonimuser' ? "Hızlı Takip İçin Giriş Yapın" : "Operasyon Merkezine Bağlan"}
          </p>
        </div>

        <div className="space-y-4">
          {role !== 'anonimuser' && (
            <input type="email" placeholder="E-posta Adresi" className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 ring-blue-500 transition-all" />
          )}
          <button 
            onClick={onLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            {role === 'anonimuser' ? <Search size={18}/> : <LogIn size={18}/>}
            {role === 'anonimuser' ? "Hemen Başla" : "Giriş Yap"}
          </button>
        </div>
      </div>
    </div>
  );
}