import React, { useState, useEffect } from 'react';
import { Mail, Lock, X, User, ArrowRight } from 'lucide-react';

export default function AuthPages({ role, setRole, onLogin, onClose, initialView = 'login' }: any) {
  const [isLoginView, setIsLoginView] = useState(initialView === 'login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Navbar'dan gelen seçime göre görünümü güncelle
  useEffect(() => {
    setIsLoginView(initialView === 'login');
  }, [initialView]);

  const handleSubmit = () => {
    if (!email || !password || (!isLoginView && !fullName)) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }
    onLogin(email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
      <div className="relative max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl space-y-6 border border-slate-100 animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
        
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
            {isLoginView ? "Tekrar Hoş Geldin" : "Bize Katıl"}
          </h2>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            {(['admin', 'kayıtlıuser']).map((r: any) => (
              <button key={r} onClick={() => setRole(r)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                {r === 'admin' ? 'Yönetici' : 'Müşteri'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {!isLoginView && (
            <div className="relative">
              <User className="absolute left-4 top-4 text-slate-300" size={18} />
              <input type="text" placeholder="Adınız Soyadınız" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-50 border rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 ring-blue-100 transition-all" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
            <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 ring-blue-100 transition-all" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-300" size={18} />
            <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 ring-blue-100 transition-all" />
          </div>
        </div>

        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 group">
          {isLoginView ? "Giriş Yap" : "Hesap Oluştur"}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="text-center">
          <button onClick={() => setIsLoginView(!isLoginView)} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
            {isLoginView ? "Hesabınız yok mu? Hemen Kayıt Ol" : "Zaten üye misiniz? Giriş Yap"}
          </button>
        </div>
      </div>
    </div>
  );
}