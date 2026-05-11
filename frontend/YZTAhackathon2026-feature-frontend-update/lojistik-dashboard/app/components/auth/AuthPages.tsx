import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, MapPin } from 'lucide-react';

export default function AuthPages({ onBack, onAuthAction }: any) {
  const [viewMode, setViewMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = () => {
    if (viewMode === 'signup') {
      if (!email || !password || !fullName) return alert("Tüm alanlar zorunlu!");
      onAuthAction('signup', { email, password, full_name: fullName, address });
    } else {
      if (!email || !password) return alert("E-posta ve şifre zorunlu!");
      onAuthAction('login', { email, password });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        
        <button onClick={onBack} className="flex items-center gap-2 text-slate-900 hover:text-emerald-600 transition-colors font-bold">
          <ArrowLeft size={20} />
          <span>Geri Dön</span>
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            {viewMode === 'login' ? 'Tekrar Hoş Geldin' : 'Yeni Hesap Oluştur'}
          </h1>
          <p className="text-slate-600 font-medium">SmartOps akıllı ticaret dünyasına adım atın.</p>
        </div>

        <div className="space-y-4 bg-slate-50 p-8 rounded-[32px] border border-slate-100 shadow-sm">
          {viewMode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Tam Adınız</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Beyza Gümüş"
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 ring-emerald-100 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">E-posta Adresi</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 ring-emerald-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 ring-emerald-100 outline-none transition-all"
              />
            </div>
          </div>

          {viewMode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Teslimat Adresi</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <textarea 
                  value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Mahalle, Sokak, No..."
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 ring-emerald-100 outline-none transition-all h-24 resize-none"
                />
              </div>
            </div>
          )}

          <button 
            onClick={handleSubmit}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            {viewMode === 'login' ? 'GİRİŞ YAP' : 'KAYIT OL'}
          </button>
        </div>

        <p className="text-center text-slate-600 font-bold">
          {viewMode === 'login' ? 'Hesabınız yok mu?' : 'Zaten üye misiniz?'}
          <button 
            onClick={() => setViewMode(viewMode === 'login' ? 'signup' : 'login')}
            className="ml-2 text-emerald-600 hover:underline"
          >
            {viewMode === 'login' ? 'Hemen Kaydol' : 'Giriş Yap'}
          </button>
        </p>
      </div>
    </div>
  );
}